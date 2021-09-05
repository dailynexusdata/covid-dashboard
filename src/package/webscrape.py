import pandas as pd
import numpy as np
import seaborn as sns
import json

def format(func):

    def decorator(*args, **kwargs):
        df = func(*args, **kwargs)
        return json.loads(df.astype({"date": "string"}).to_json(orient="records"))

    return decorator


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
    data["pct"] = data.cumulative_reported_deaths / data.population

    return data[["date", "area", "pct"]] \
        .rename({ "area": "county" }, axis=1) \
        .dropna()


def seven_day_avg(c):
    return np.convolve(c, np.ones(7), 'same') / 7


@format
def get_daily_cases(data):
    sb_cases = data[data.area == "Santa Barbara"][["date", "cases", "deaths"]]
    sb_cases["avg"] = seven_day_avg(sb_cases.cases)
    sb_cases["death_avg"] = seven_day_avg(sb_cases.deaths)
    return sb_cases


@format
def get_ages(data):
    ageGroups = data[data.demographic_category == "Age Group"] \
        .reset_index(drop=True)

    ageGroups["partialPct"] = ageGroups["cumulative_at_least_one_dose"] / ageGroups["est_population"]

    return ageGroups[["date", "partialPct", 'demographic_value']] \
        .sort_values(by=["demographic_value", "date"]) 


def main():
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

    output = json.dumps(dict(
        ca_vaccines=get_ca_vaccines(combined),
        vaccines=get_vaccines(combined),
        deaths=get_deaths(cases_deaths),
        dailyCases=get_daily_cases(cases_deaths),
        ages=get_ages(vaccines_demographics)
    ))

    with open("../../dist/data/combined.json", "w") as outfile:
        outfile.write(output)


if __name__ == "__main__":
    main()