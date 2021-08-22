/**
 * @author Alex Rudolph
 */
import * as d3 from 'd3';

const size = {
  varHeight: 200,
  casesHeight: 200,
  timeHeight: 16,
  width: Math.min(600, window.innerWidth - 40),
};

const margin = {
  left: 10,
  right: 10,
};

const marginVariants = {
  top: 2,
  bottom: 2,
};

const makeVariants = (svg, variants, x) => {
  //   svg.attr('height', size.varHeight).attr('width', size.width);

  const variantNames = variants.columns.slice(1);

  const bottom = size.varHeight + size.casesHeight + size.timeHeight;
  const top = bottom - size.varHeight;

  const stacked = d3
    .stack()
    .keys(variantNames)
    .value((d, key) => d[key])(variants);

  const y = d3
    .scaleLinear()
    .domain([0, Math.max(...stacked[stacked.length - 1].map((d) => d[1]))])
    .range([top + marginVariants.top, bottom - marginVariants.bottom]);

  //   const y = d3
  //     .scaleLinear()
  //     .domain([0, Math.max(...stacked[stacked.length - 1].map((d) => d[1]))])
  //     .range([size.casesHeight + marginVariants.top, marginVariants.bottom]);

  const area = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]))
    .curve(d3.curveCatmullRom);

  const color = d3
    .scaleOrdinal()
    .domain(variantNames)
    .range(['#4e79a7', '#59a14f', '#76b7b2', '#f28e2c', '#e15759']);

  svg
    .selectAll('variants')
    .data(stacked)
    .enter()
    .append('path')
    .attr('d', area)
    .attr('fill', (d) => color(d.key))
    .on('mouseenter', (_, d) => console.log(d.key));
};

const marginCases = {
  top: 2,
  bottom: 2,
};

const makeCases = (svg, cases, x) => {
  //   svg.attr('height', size.casesHeight).attr('width', size.width);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(cases, (d) => d.cases))
    .range([size.casesHeight - marginCases.bottom, marginCases.top]);

  const path = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.avg))
    .curve(d3.curveCatmullRom);

  const barWidth = 1;
  svg
    .selectAll('bars')
    .data(cases)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.date) - barWidth / 2)
    .attr('width', barWidth)
    .attr('y', (d) => y(d.cases))
    .attr('height', (d) => size.casesHeight - marginCases.bottom - y(d.cases))
    .attr('fill', 'red');

  svg
    .datum(cases)
    .append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 2);
};

const makeTimeline = (svg, x) => {
  //   svg.attr('height', size.timeHeight).attr('width', size.width);

  const formatTime = d3.timeFormat('%B');

  svg
    .selectAll('labs')
    .data(x.ticks(5))
    .enter()
    .append('text')
    .text((d) => formatTime(d))
    .attr('y', size.timeHeight / 2 + size.casesHeight)
    .attr('x', (d) => x(d))
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle');
};

const makePlot = (cases, variants) => {
  const container = d3.select('#sbCounty-cases-vars');
  container.selectAll('*').remove();

  const main = container.append('svg');
  main
    .attr('height', size.casesHeight + size.varHeight + size.timeHeight)
    .attr('width', size.width);

  const x = d3
    .scaleTime()
    .domain(d3.extent(cases, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  makeTimeline(main, x);
  makeVariants(main, variants, x);
  makeCases(main, cases, x);
};

export default makePlot;
