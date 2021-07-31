import pandas as pd
import numpy as np
# links: https://data.chhs.ca.gov/dataset

# cases_deaths = pd.read_csv("https://data.chhs.ca.gov/dataset/f333528b-4d38-4814-bebb-12db1f10f535/resource/046cdd2b-31e5-4d34-9ed3-b48cdbc4be7a/download/covid19cases_test.csv")
# cases_deaths = cases_deaths[cases_deaths["area"] == "Santa Barbara"]
# print(cases_deaths.columns)

# should check if this is different??
# probable_cases = pd.read_csv("https://data.chhs.ca.gov/dataset/bb31bcdf-2085-4b47-92aa-13cdd6b37435/resource/e787c00b-b22d-4a6e-9a93-7a90d2be2797/download/covid19probablecases.csv")
# probable_cases = probable_cases[probable_cases["area"] == "Santa Barbara"]
# print(probable_cases)

vaccines = pd.read_csv("https://data.chhs.ca.gov/dataset/e283ee5a-cf18-4f20-a92c-ee94a2866ccd/resource/130d7ba2-b6eb-438d-a412-741bde207e1c/download/covid19vaccinesbycounty.csv")
vaccines = vaccines[vaccines["county"] == "Santa Barbara"]

vaccines["date"] = pd.to_datetime(vaccines["administered_date"])

vaccines \
    .drop("county", axis=1) \
    .sort_values(by="date") \
    .to_csv("dist/data/vaccines.csv", index=False)

print(vaccines.columns)

# vaccines_demographics = pd.read_csv("https://data.chhs.ca.gov/dataset/e283ee5a-cf18-4f20-a92c-ee94a2866ccd/resource/71729331-2f09-4ea4-a52f-a2661972e146/download/covid19vaccinesbycountybydemographic.csv")
# vaccines_demographics = vaccines_demographics[vaccines_demographics["county"] == "Santa Barbara"]
# print(vaccines_demographics.columns)

# nursing = pd.read_csv("https://data.chhs.ca.gov/dataset/7759311f-1aa8-4ff6-bfbb-ba8f64290ae2/resource/d4d68f74-9176-4969-9f07-1546d81db5a7/download/covid19datanursinghome.csv")
# nursing = nursing[nursing["county"] == "Santa Barbara"]
# print(nursing)