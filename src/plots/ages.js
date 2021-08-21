/**
 * @author alex rudolph
 */

import * as d3 from 'd3';
import { nest } from 'd3-collection';

const makePlot = (ageData) => {
  const container = d3.select('#sbCounty-vaccine-ages');
  container.selectAll('*').remove();

  const data = nest()
    .key((d) => d.group)
    .entries(ageData);

  const size = {
    height: 400,
    width: Math.min(720, window.innerWidth - 40),
  };

  const margin = {
    top: 20,
    right: 120,
    bottom: 30,
    left: 10,
  };

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data[0].values, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const y = d3.scaleLinear().range([size.height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.pct));

  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  svg
    .selectAll('lines')
    .data(data)
    .enter()
    .append('path')
    .attr('d', (d) => line(d.values))
    .attr('stroke', (d, i) => colors(i))
    .attr('stroke-width', 4)
    .attr('fill', 'none');

  svg
    .append('g')
    .style('color', '#adadad')
    .style('font-size', '12pt')
    .attr('transform', `translate(0, ${size.height - margin.bottom + 5})`)
    .call(
      d3
        .axisBottom()
        .scale(x)
        .ticks(6)
        .tickFormat((d) => {
          const t = d3.timeFormat('%b')(d);
          return t === 'Jan' ? `${t} '21` : t;
        }),
    );

  const ylines = svg.append('g');

  y.ticks(4)
    .slice(1)
    .forEach((yVal, i) => {
      ylines
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', size.width - margin.right)
        .attr('y1', y(yVal))
        .attr('y2', y(yVal))
        .attr('stroke', '#d3d3d3')
        .attr('stroke-width', '0.5px');

      ylines
        .append('text')
        .text(`${yVal * 100}%${i === 5 ? ' of Total County Population' : ''}`)
        .attr('fill', '#adadad')
        .attr('x', margin.left)
        .attr('y', y(yVal) - 5);
    });

  ylines.lower();

  const endLabels = svg.selectAll('endLabels').data(data).join('g');

  endLabels
    .append('text')
    .attr('x', size.width - margin.right)
    .attr(
      'y',
      (d, i) =>
        y(d.values[d.values.length - 1].pct) +
        (i === 2 ? -20 : i === 3 ? 12 : 0),
    )
    .attr('alignment-baseline', 'middle')
    .attr('font-weight', 'bold')
    .attr('fill', (d, i) => colors(i))
    .text((d) => `${d.key} year olds`);

  endLabels
    .append('text')
    .attr('x', size.width - margin.right)
    .attr(
      'y',
      (d, i) =>
        y(d.values[d.values.length - 1].pct) +
        16 +
        (i === 2 ? -20 : i === 3 ? 12 : 0),
    )
    .text((d) => `${Math.round(d.values[d.values.length - 1].pct * 100)}%`)
    .attr('alignment-baseline', 'middle');
};

export default makePlot;
