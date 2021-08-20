/**
 * Daily Case Tracker for Santa Barbara County
 *
 * @author alex
 *
 */
import * as d3 from 'd3';

/**
 * @param {*} data - dailyCases.csv
 *
 * @author Zach
 *
 * @since 08/19/2021
 */

const makeDailyCases = (data) => {
  /*
     Container Setup:
   */

  // The class is necessary to apply styling
  const container = d3.select('#sbCounty-dailyCases-d3');

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container.append('h1').text('Daily Cases in Santa Barbara County');

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 10,
    right: 10,
    bottom: 25,
    left: 10,
  };

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  container.append('a').text('Source: __________').attr('href', '');

  /*
     Create Scales:
   */

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.cases))
    .range([size.height - margin.bottom, margin.top]);

  // Axes
  svg
    .append('g')
    .style('color', '#adadad')
    .style('font-size', '12pt')
    .attr('transform', `translate(0, ${size.height - margin.bottom})`)
    .call(
      d3
        .axisBottom()
        .scale(x)
        .tickFormat((d) => {
          const t = d3.timeFormat("%b '%g")(d);
          return t;
        }),
    );
  const horizLines = svg.append('g');
  y.ticks(4).slice(1).forEach((yVal) => {
    horizLines
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', size.width - margin.right)
      .attr('y1', y(yVal))
      .attr('y2', y(yVal))
      .attr('stroke', '#d3d3d3')
      .attr('stroke-width', '0.5px');

    horizLines
      .append('text')
      .text(yVal)
      .style('font-size', '10pt')
      .attr('fill', '#adadad')
      .attr('x', margin.left)
      .attr('y', y(yVal) - 5);
  });
  /*
     Start Plot:
   */

  const bars = svg
    .append('g')
    .attr('fill', '#85BDDEbb')
    .selectAll('bars')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.date))
    .attr('width', 1)
    .attr('y', (d) => y(d.cases))
    .attr('height', (d) => size.height - margin.bottom - y(d.cases));
    /* if (y(d.cases) < 0) {
        console.log(d);
        return size, height;
      } */
  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.avg));

  svg
    .append('g')
    .datum(data)
    .append('path')
    .attr('d', line)
    .attr('stroke', '#D96942')
    .attr('stroke-width', 2)
    .attr('fill', 'none');
};

export default makeDailyCases;
