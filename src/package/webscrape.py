import pandas as pd
import numpy as np
import seaborn as sns
import json

from datetime import datetime, timedelta
import boto3
import logging

log = logging.getLogger(__name__)


def format(func):

    def json_output(data, *args, **kwargs):
        df = func(data, *args, **kwargs)
        return json.loads(df.astype({"date": "string"}).to_json(orient="records"))

    return json_output


@format
def get_ca_vaccines(data):
    return data[[
        "county", 
        "cumulative_at_least_one_dose", 
        "date", 
        "population", 
        "cumulative_fully_vaccinated"
    ]].sort_values(by=["county", "date"])


@format
def get_vaccines(data):
    return data[
        data.county == "Santa Barbara"
    ][[
        "date", 
        "population", 
        "cumulative_pfizer_doses", 
        "cumulative_moderna_doses", 
        "cumulative_jj_doses", 
        "cumulative_fully_vaccinated", 
        "cumulative_at_least_one_dose"
    ]].sort_values(by="date")


@format
def get_deaths(data):
    data = data[["date", "area", "cumulative_reported_deaths", "population"]].dropna()
    data["pct"] = data.cumulative_reported_deaths / data.population

    return data[["date", "area", "pct"]] \
        .rename({ "area": "county" }, axis=1)


def seven_day_avg(c):
    return np.convolve(c, np.ones(7), 'same') / 7


@format
def get_daily_cases(data):
    sb_cases = data[data.area == "Santa Barbara"][["date", "cases", "deaths"]].dropna()
    sb_cases["avg"] = seven_day_avg(sb_cases.cases)
    sb_cases["death_avg"] = seven_day_avg(sb_cases.deaths)
    return sb_cases


@format
def get_ages(data):
    ageGroups = data[data.demographic_category == "Age Group"] \
        .reset_index(drop=True) \
        .dropna()

    ageGroups["partialPct"] = ageGroups["cumulative_at_least_one_dose"] / ageGroups["est_population"]

    return ageGroups[["date", "partialPct", 'demographic_value']] \
        .sort_values(by=["demographic_value", "date"]) 


@format
def get_races(data):
    raceGroups = data[data.demographic_category == "Race/Ethnicity"] \
        .reset_index(drop=True) \
        .dropna()

    raceGroups["partialPct"] = raceGroups["cumulative_at_least_one_dose"] / raceGroups["est_population"]

    raceGroups = raceGroups[raceGroups.demographic_value != "Unknown"]
    raceGroups = raceGroups[raceGroups.demographic_value != "Other Race"]
    raceGroups = raceGroups[raceGroups.demographic_value != "Native Hawaiian or Other Pacific Islander"]
    raceGroups = raceGroups[raceGroups.demographic_value != "American Indian or Alaska Native"]

    raceGroups.demographic_value = raceGroups.demographic_value.replace("Black or African American", "Black")
    # raceGroups.demographic_value = raceGroups.demographic_value.replace("American Indian or Alaska Native", "Indigenous")

    return raceGroups[["date", "partialPct", "demographic_value"]]


@format
def get_zip_codes(data):
    zip_codes_select = np.array("93067 93441 93111 93108 93109 93013 93103 93101 93110 93105 93440 93460 93463 93434 93427 93454 93117 93458 93254 93455 93436 93429".split(" ")).astype("int")

    data = data[[(zc in zip_codes_select) for zc in data.zip_code_tabulation_area]].copy()

    data["date"] = pd.to_datetime(data["as_of_date"])
    last_date = np.max(data.date)

    data = data[data.date == last_date]
    
    return data[[
        "percent_of_population_with_1_plus_dose", 
        "date", 
        "zip_code_tabulation_area"
    ]].rename({ "zip_code_tabulation_area": "zip"}, axis=1).reset_index(drop=True)


def fetch_data():
    cases_deaths = pd.read_csv(
        "https://data.chhs.ca.gov/dataset/f333528b-4d38-4814-bebb-12db1f10f535/"
        + "resource/046cdd2b-31e5-4d34-9ed3-b48cdbc4be7a/download/"
        + "covid19cases_test.csv"
    ).dropna(subset=["date"])
    
    cases_deaths["date"] = pd.to_datetime(cases_deaths["date"])

    vaccines = pd.read_csv(
        "https://data.chhs.ca.gov/dataset/e283ee5a-cf18-4f20-a92c-ee94a2866ccd/"
        + "resource/130d7ba2-b6eb-438d-a412-741bde207e1c/download/"
        + "covid19vaccinesbycounty.csv"
    )

    vaccines["date"] = pd.to_datetime(vaccines["administered_date"])
    vaccines = vaccines.drop(["administered_date"], axis=1)

    vaccines.county = np.where(vaccines.county == "All CA Counties", "California", vaccines.county)
    cases_deaths.area = np.where(cases_deaths.area == "All CA Counties", "California", cases_deaths.area)

    combined = vaccines \
        .astype({"county": "string", "date": np.datetime64}) \
        .merge(
            cases_deaths[["date", "area", "population"]].astype({"area": "string"}),
            left_on=["county", "date"],
            right_on=["area","date"],
            how="inner"
        )
        
    combined = combined[combined.county != "Unknown"]

    vaccines_demographics = pd.read_csv(
        "https://data.chhs.ca.gov/dataset/e283ee5a-cf18-4f20-a92c-ee94a2866ccd/"
        + "resource/71729331-2f09-4ea4-a52f-a2661972e146/download/"
        + "covid19vaccinesbycountybydemographic.csv"
    )

    vaccines_demographics = vaccines_demographics[vaccines_demographics["county"] == "Santa Barbara"]
    vaccines_demographics["date"] = pd.to_datetime(vaccines_demographics["administered_date"])

    zip_codes = pd.read_csv(
        "https://data.chhs.ca.gov/dataset/ead44d40-fd63-4f9f-950a-3b0111074de8/"
        + "resource/ec32eece-7474-4488-87f0-6e91cb577458/download/"
        + "covid19vaccinesbyzipcode_test.csv"
    )

    output = json.dumps(dict(
        ca_vaccines=get_ca_vaccines(combined),
        vaccines=get_vaccines(combined),
        deaths=get_deaths(cases_deaths),
        dailyCases=get_daily_cases(cases_deaths),
        ages=get_ages(vaccines_demographics),
        race=get_races(vaccines_demographics),
        zipcodes=get_zip_codes(zip_codes)
    ), indent=2)

    return output


def upload(data):
    s3 = boto3.resource('s3')
    response = s3.Object("dailynexus", "covid_dashboard_data.json").put(
        Body=data,
        ContentType="application/json",
        ACL="public-read",
        Expires=(datetime.now() + timedelta(hours=48))
    )
    log.info(response)


def lambda_handler(event=None, context=None, dry_run=False):
    covid_data = fetch_data()
    upload(covid_data)


def main():
    lambda_handler(None, None, False)


if __name__ == "__main__":
    main()
    
    # with open("../../dist/data/combined.json", "w") as outfile:
    #     outfile.write(fetch_data())
