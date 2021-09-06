import * as d3 from 'd3';
import './styles.scss';

import makeVaccineTypes from './vaccineTypes';
import makeVaccineCounty from './vaccineCounty';
import makeSbVaccines from './sbVaccine';
import makeDeathsCounty from './deathsCounties';
import makeVaccinesZip from './vaccinesZip';
import makeDailyCases from './sbDailyCases';
import makeAges from './ages';
import makeRaces from './races';
import makeDailyDeaths from './sbDailyDeaths';
/**
 *
 * Good to checkout:
 * https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/covid-19-vaccines-distribution/
 */

(async () => {
  const data = await d3.json('dist/data/combined.json');

  const convertTime = d3.timeParse('%Y-%m-%d');

  const dailyCases = data.dailyCases.map((d) => ({
    date: convertTime(d.date),
    avg: +d.avg,
    cases: +d.cases,
  }));

  const dailyDeaths = data.dailyCases.map((d) => ({
    date: convertTime(d.date),
    deaths: +d.deaths,
    death_avg: +d.death_avg,
  }));

  const vaccineData = data.vaccines.map((d) => ({
    date: convertTime(d.date),
    cumulative_pfizer_doses: +d.cumulative_pfizer_doses,
    cumulative_moderna_doses: +d.cumulative_moderna_doses,
    cumulative_jj_doses: +d.cumulative_jj_doses,
    fullPct: +d.cumulative_fully_vaccinated / +d.population,
    singlePct: +d.cumulative_at_least_one_dose / +d.population,
    population: +d.population,
  }));

  const countyVaccineData = data.ca_vaccines.map((d) => ({
    ...d,
    date: convertTime(d.date),
    cumulative_at_least_one_dose: +d.cumulative_at_least_one_dose,
    cumulative_fully_vaccinated: +d.cumulative_fully_vaccinated,
    population: +d.population,
  }));

  const countyDeathData = data.deaths.map((d) => ({
    ...d,
    date: convertTime(d.date),
    pct: +d.pct,
  }));

  const ages = data.ages.map((d) => ({
    date: convertTime(d.date),
    group: d.demographic_value,
    pct: d.partialPct,
  }));

  const races = data.race.map((d) => ({
    date: convertTime(d.date),
    group: d.demographic_value,
    pct: +d.partialPct,
  }));

  const zipData = await d3.json(
    // 'dist/data/sbzips.json'
    'https://raw.githubusercontent.com/dailynexusdata/covid-dashboard/main/dist/data/sbzips.json',
  );

  const resize = () => {
    makeVaccineTypes(vaccineData);
    makeVaccineCounty(countyVaccineData);
    makeSbVaccines(vaccineData);
    makeDeathsCounty(countyDeathData);
    makeDailyCases(dailyCases);
    makeDailyDeaths(dailyDeaths);

    // // map chart
    // // comment out the above 4 lines to test just this
    makeVaccinesZip(zipData);
    makeAges(ages);
    makeRaces(races);
  };

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
})();
