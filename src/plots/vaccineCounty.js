/**
 * @file CA County testing rates
 *
 * @author alex rudolph
 * @author zach
 *
 * @since 8/3/2021
 */
import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';

/**
 * Plotting function
 *
 * @param {*} data - data/ca_vaccines.csv with date and cumulative individual doses converted
 *
 * @author alex rudolph
 *
 * @since 8/3/2021
 */
const makeVaccineCounty = (data) => {
  const container = d3.select('#dosesByCounty-d3');
  container.selectAll('*').remove();

  container.style('display', 'flex').style('flex-wrap', 'wrap');

  const nestedData = d3Collection
    .nest()
    .key((d) => d.county)
    .entries(data);

  const svg = container.append('svg').attr('width', 600).attr('height', 400);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, 600]);

  const y = d3.scaleLinear().domain([0, 600000]).range([400, 0]);

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.cumulative_total_doses));

  svg
    .selectAll('lines')
    .data(nestedData)
    .enter()
    .append('path')
    .attr('d', (d) => line(d.values))
    .attr('stroke', (d) => (d.key === 'Santa Barbara' ? 'blue' : 'black'))
    .attr('stroke-width', (d) => (d.key === 'Santa Barbara' ? 3 : 1))
    .attr('fill', 'none');
};

export default makeVaccineCounty;
