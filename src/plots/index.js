import * as d3 from 'd3';
import './styles.scss';

import makeVaccineTypes from './vaccineTypes';
import makeVaccineCounty from './vaccineCounty';
import makeSbVaccines from './sbVaccine';
import makeDeathsCounty from './deathsCounties';
import makeVaccinesZip from './vaccinesZip';

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
      cumulative_fully_vaccinated: +d.cumulative_fully_vaccinated,
      cumulative_at_least_one_dose: +d.cumulative_at_least_one_dose,
      population: +d.population,
    }),
  );

  console.log(vaccineData.columns);

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

  const zipData = await d3.json('dist/data/sbzips.json');

  const resize = () => {
    makeVaccineTypes(vaccineData);
    makeVaccineCounty(countyVaccineData);
    makeSbVaccines(vaccineData);
    makeDeathsCounty(countyDeathData);

    // map chart
    // comment out the above 4 lines to test just this
    makeVaccinesZip(zipData);
  };

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
})();
