import * as d3 from 'd3';
import './styles.scss';

import makeVaccineTypes from './vaccineTypes';
import makeVaccineCounty from './vaccineCounty';
import makeSbVaccines from './sbVaccine';
import makeDeathsCounty from './deathsCounties';
import makeVaccinesZip from './vaccinesZip';

import makeAges from './ages';

import makePrintCasesVariants from './printCasesVariants';
import makePrintIvCases from './printIvCases';
import makePrintTable from './printTable';

/**
 *
 * Good to checkout:
 * https://www.latimes.com/projects/california-coronavirus-cases-tracking-outbreak/covid-19-vaccines-distribution/
 */

(async () => {
  const convertTime = d3.timeParse('%Y-%m-%d');

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

  const countyVaccineData = await d3.csv('dist/data/ca_vaccines.csv', (d) => ({
    ...d,
    date: convertTime(d.date),
    cumulative_at_least_one_dose: +d.cumulative_at_least_one_dose,
    cumulative_fully_vaccinated: +d.cumulative_fully_vaccinated,
    population: +d.population,
  }));

  const countyDeathData = await d3.csv('dist/data/deaths.csv', (d) => ({
    ...d,
    date: convertTime(d.date),
    population: +d.population,
    cumulative_reported_deaths: +d.cumulative_reported_deaths,
  }));

  const countyVariantData = await d3.csv('dist/data/variants.csv', (d) => {
    const output = {};

    Object.entries(d).forEach(([key, val]) => {
      output[key] = key !== 'date' ? +val : convertTime(val);
    });

    return output;
  });

  const countyAgeData = await d3.csv('dist/data/ages.csv', (d) => ({
    group: d.demographic_value,
    pct: +d.partialPct,
    date: convertTime(d.date),
  }));

  const countyCases = await d3.csv('dist/data/dailyCases.csv', (d) => ({
    date: convertTime(d.date),
    cases: +d.cases,
    avg: +d.avg,
  }));

  const ivCases = await d3.csv('dist/data/ivcases.csv', (d) => ({
    date: convertTime(d.date),
    cases: +d.cases,
    avg: +d.avg,
  }));

  const zipData = await d3.json('dist/data/sbzips.json');

  const resize = () => {
    makeVaccineTypes(vaccineData);
    makeVaccineCounty(countyVaccineData);
    makeSbVaccines(vaccineData);
    makeDeathsCounty(countyDeathData);
    makePrintIvCases(ivCases);

    makePrintCasesVariants(countyCases, countyVariantData);
    makeAges(countyAgeData);
    makePrintTable();

    // map chart
    // comment out the above 4 lines to test just this
    makeVaccinesZip(zipData);
  };

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
})();
