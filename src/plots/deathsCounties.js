/**
 * @file CA County deaths
 *
 * @author alex rudolph
 *
 * @since 8/3/2021
 */
import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';

/**
 *
 * @param {*} data
 *
 * @author alex rudolph
 *
 * @since 8/9/2021
 */
const makePlot = (container, data) => {
  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    left: 10,
    top: 10,
    right: 10,
    bottom: 10,
  };

  const nestedData = d3Collection
    .nest()
    .key((d) => d.county)
    .entries(data);

  console.log(nestedData);

  const svg = container
    .append('svg')
    .attr('width', size.width)
    .attr('height', size.height);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.cumulative_reported_deaths / d.population))
    .range([size.height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.cumulative_reported_deaths / d.population));

  const color = (s) => {
    if (s === 'California') {
      // UGHHHHHHHHHHHHHHHHHHHHHHHHHHH
      // I DONT LIKE THIS COLOR
      return '#f28e2c'; // af7aa1;
    }
    if (s === 'Santa Barbara') {
      return '#4e79a7';
    }
    return '#d3d3d3';
  };

  svg
    .selectAll('lines')
    .data(
      nestedData.sort((a, b) => {
        if (a.key === 'Santa Barbara') {
          return 1;
        }
        if (b.key === 'Santa Barbara') {
          return -1;
        }
        if (a.key === 'California') {
          return 1;
        }
        if (b.key === 'California') {
          return -1;
        }
        return 0;
      }),
    )
    .enter()
    .append('path')
    .attr('d', (d) => line(d.values))
    .attr('stroke', (d) => color(d.key))
    .attr('stroke-width', (d) =>
      ['California', 'Santa Barbara'].includes(d.key) ? 3 : 1,
    )
    .attr('stroke-opacity', (d) =>
      ['California', 'Santa Barbara'].includes(d.key) ? 1 : 0.5,
    )
    .attr('fill', 'none');
};

/**
 *
 * @param {*} data
 *
 * @author alex rudolph
 *
 * @since 8/9/2021
 */
const deathsCounties = (data) => {
  const container = d3.select('#deathsByCounty-d3');
  container.selectAll('*').remove();

  container.append('h1').text('County Death Rate');

  makePlot(container, data);
};

export default deathsCounties;
