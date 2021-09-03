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
  const convertTime = d3.timeParse('%Y-%m-%d');

  const caseData = await d3.csv('dist/data/dailyCases.csv', (d) => ({
    date: convertTime(d.date),
    cases: +d.cases,
    avg: +d.avg,
    deaths: +d.deaths,
    death_avg: +d.death_avg,
  }));
  makeDailyCases(caseData);
  makeDailyDeaths(caseData);

  const vaccineData = await d3.csv(
    'dist/data/vaccines.csv',
    // 'https://raw.githubusercontent.com/dailynexusdata/covid-dashboard/main/dist/data/vaccines.csv',
    (d) => ({
      date: convertTime(d.date),
      cumulative_pfizer_doses: +d.cumulative_pfizer_doses,
      cumulative_moderna_doses: +d.cumulative_moderna_doses,
      cumulative_jj_doses: +d.cumulative_jj_doses,
      fullPct: +d.cumulative_fully_vaccinated / +d.population,
      singlePct: +d.cumulative_at_least_one_dose / +d.population,
      population: +d.population,
    }),
  );
  makeSbVaccines(vaccineData);
  makeVaccineTypes(vaccineData);

  // console.log(vaccineData.columns);

  const countyVaccineData = await d3.csv('dist/data/ca_vaccines.csv', (d) => ({
    ...d,
    date: convertTime(d.date),
    cumulative_at_least_one_dose: +d.cumulative_at_least_one_dose,
    cumulative_fully_vaccinated: +d.cumulative_fully_vaccinated,
    population: +d.population,
  }));
  makeVaccineCounty(countyVaccineData);

  const countyDeathData = await d3.csv('dist/data/deaths.csv', (d) => ({
    ...d,
    date: convertTime(d.date),
    population: +d.population,
    cumulative_reported_deaths: +d.cumulative_reported_deaths,
  }));
  makeDeathsCounty(countyDeathData);

  const ages = await d3.csv('dist/data/ages.csv', (d) => ({
    date: convertTime(d.date),
    group: d.demographic_value,
    pct: d.partialPct,
  }));

  makeAges(ages);

  const races = await d3.csv('dist/data/races.csv', (d) => ({
    date: convertTime(d.date),
    group: d.demographic_value,
    pct: d.partialPct,
  }));
  makeRaces(races);
  const zipData = await d3.json('dist/data/sbzips.json');
  makeVaccinesZip(zipData);

  const resize = () => {
    makeVaccineTypes(vaccineData);
    makeVaccineCounty(countyVaccineData);
    makeSbVaccines(vaccineData);
    makeDeathsCounty(countyDeathData);
    makeDailyCases(caseData);
    makeDailyDeaths(caseData);
    makeRaces(races);

    // map chart
    // comment out the above 4 lines to test just this
    makeVaccinesZip(zipData);
    makeAges(ages);
  };

  window.addEventListener('resize', () => {
    resize();
  });
})();
