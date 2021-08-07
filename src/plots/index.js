import * as d3 from 'd3';
import './styles.scss';

import makeVaccineTypes from './vaccineTypes';
import makeVaccineCounty from './vaccineCounty';

(async () => {
  const convertTime = d3.timeParse('%Y-%m-%d');

  const vaccineData = await d3.csv(
    'https://raw.githubusercontent.com/dailynexusdata/covid-dashboard/main/dist/data/vaccines.csv',
    (d) => ({
      date: convertTime(d.date),
      cumulative_pfizer_doses: +d.cumulative_pfizer_doses,
      cumulative_moderna_doses: +d.cumulative_moderna_doses,
      cumulative_jj_doses: +d.cumulative_jj_doses,
    }),
  );

  console.log(vaccineData.columns);

  const countyVaccineData = await d3.csv('dist/data/ca_vaccines.csv', (d) => ({
    ...d,
    date: convertTime(d.date),
    cumulative_total_doses: +d.cumulative_total_doses,
  }));

  const resize = () => {
    makeVaccineTypes(vaccineData);
    makeVaccineCounty(countyVaccineData);
  };

  window.addEventListener('resive', () => {
    resize();
  });

  resize();
})();
