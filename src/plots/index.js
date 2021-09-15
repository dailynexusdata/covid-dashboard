import * as d3 from 'd3';
import './styles.scss';

import { formatDate } from '@dailynexus/utility/bin';
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
  const data = await d3.json(
    'https://dailynexus.s3-us-west-1.amazonaws.com/covid_dashboard_data.json',
  );

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

  zipData.features = zipData.features.map((d) => {
    const zp = d.properties.zip;
    const dat = data.zipcodes.find((z) => z.zip === zp);

    return {
      ...d,
      properties: {
        ...d.properties,
        // pop12: Math.round(dat.pop),
        // unvac: Math.round(dat.pop - dat.vaccinated),
        vacPct: dat.percent_of_population_with_1_plus_dose,
        date: convertTime(dat.date),
      },
    };
  });

  const container = d3.select('#covid-dashboard-d3');

  // container
  //   .append('h1')
  //   .text('COVID-19 in Santa Barbara County')
  //   .attr('class', 'covid-dashboard-d3');

  container
    .append('p')
    .text(
      'This page shows the status of COVID-19 in Santa Barbara County in the following three areas:',
    )
    .attr('class', 'covid-dashboard-d3');

  const linkArea = container
    .append('div')
    .style('height', '50px')
    .style('display', 'flex')
    .style('justify-content', 'center')
    .style('align-items', 'center');

  linkArea
    .append('a')
    .attr('href', '#covid-dashboard-cases-header')
    .text('Cases')
    .attr('class', 'covid-dashboard-d3-links');
  linkArea
    .append('a')
    .attr('href', '#covid-dashboard-vaccines-header')
    .text('Vaccines')
    .attr('class', 'covid-dashboard-d3-links');
  linkArea
    .append('a')
    .attr('href', '#covid-dashboard-deaths-header')
    .text('Deaths')
    .attr('class', 'covid-dashboard-d3-links');

  container
    .append('p')
    .text(`Last updated ${formatDate(dailyCases[dailyCases.length - 1].date)}.`)
    .attr('class', 'covid-dashboard-d3');

  container
    .append('h1')
    .text('Santa Barbara County Cases')
    .attr('class', 'covid-dashboard-d3')
    .attr('id', 'covid-dashboard-cases-header');
  container.append('div').html(`<div style="display: flex; justify-content: center">
  <div id="sbCounty-dailyCases-d3" class="covid-dashboard-d3"></div>
</div>`);
  container
    .append('h1')
    .text('Santa Barbara County Vaccinations')
    .attr('class', 'covid-dashboard-d3')
    .attr('id', 'covid-dashboard-vaccines-header');
  container.append('div').html(`
  
<div style="display: flex; justify-content: center">
<div id="sbCounty-vaccines-d3" class="covid-dashboard-d3"></div>
</div>
  
  <div id="dosesByVaccine-d3" class="covid-dashboard-d3"></div>
<div style="display: flex; justify-content: center">
    <div id="dosesByCounty-d3" class="covid-dashboard-d3"></div>
</div>
<div style="display: flex; justify-content: center">
    <div id="vacByZipCode-d3" class="covid-dashboard-d3"></div>
</div>
<div style="display: flex; justify-content: center">
    <div id="sbCounty-vaccine-ages" class="covid-dashboard-d3"></div>
</div>
<div style="display: flex; justify-content: center">
    <div id="vaccinesbyRace-d3" class="covid-dashboard-d3"></div>
</div>`);
  container
    .append('h1')
    .text('Santa Barbara County Deaths')
    .attr('class', 'covid-dashboard-d3')
    .attr('id', 'covid-dashboard-deaths-header');
  container.append('div').html(`<div style="display: flex; justify-content: center">
  <div id="sbCounty-dailyDeaths-d3" class="covid-dashboard-d3"></div>
</div>
<div style="display: flex; justify-content: center">
  <div id="deathsByCounty-d3" class="covid-dashboard-d3"></div>
</div>`);
  const resize = () => {
    makeDailyCases(dailyCases);
    makeSbVaccines(vaccineData);
    makeVaccineTypes(vaccineData);
    makeVaccineCounty(countyVaccineData);
    makeVaccinesZip(zipData);
    makeAges(ages);
    makeRaces(races);
    makeDeathsCounty(countyDeathData);
    makeDailyDeaths(dailyDeaths);
  };

  window.addEventListener('resize', () => {
    resize();
  });

  resize();
})();
