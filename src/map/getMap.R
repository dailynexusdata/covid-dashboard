library(dplyr)
library(sf)
library(geojsonio)

setwd("C:/nexus/data-gh/covid-dashboard/src/map")

# Zip code from TIGER
# https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2019&layergroup=ZIP+Code+Tabulation+Areas
map <- read_sf("./tl_2019_us_zcta510/tl_2019_us_zcta510.shp")

data <- read.csv("vaccinationZipCode.csv")

sbzips <- inner_join(
    data,
    map %>% mutate(ZCTA5CE10 = as.numeric(ZCTA5CE10)),
    by=c("zip"="ZCTA5CE10")
) %>%
    mutate(vacPct = 1 - unvac / pop12) %>%
    st_as_sf()

sbzips %>%
    arrange(desc(vacPct))

sbzips %>%
    arrange(vacPct)


plot(st_geometry(sbzips %>% filter(zip == 93111)), col = sf.colors(12, categorical = TRUE))

# convert to GEOJson format
sbzips %>%
    geojson_json() %>%
    geojson_write("map/sbzips.json")
