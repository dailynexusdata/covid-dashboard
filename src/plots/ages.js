/**
 * @author alex rudolph
 */

import * as d3 from 'd3';
import { nest } from 'd3-collection';
import { pointer } from 'd3-selection';

const makePlot = (ageData) => {
  const container = d3.select('#sbCounty-vaccine-ages');
  container.selectAll('*').remove();

  const data = nest()
    .key((d) => d.group)
    .entries(ageData);

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  container.style('width', `${size.width}px`);

  const margin = {
    top: 20,
    right: 120,
    bottom: 30,
    left: 10,
  };

  container.append('h1').text('title');

  const svg = container.append('svg').attr('height', size.height).attr('width', size.width);

  container
    .append('p')
    .html(
      "Source: <a href='https://data.chhs.ca.gov/'>California Health and Human Services Agency</a>",
    );

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

  const lines = svg
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
        .ticks(window.innerWidth < 450 ? 3 : 5)
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
    .attr('y', (d, i) => y(d.values[d.values.length - 1].pct) + (i === 2 ? -20 : i === 3 ? 12 : 0))
    .attr('alignment-baseline', 'middle')
    .attr('font-weight', 'bold')
    .attr('fill', (d, i) => colors(i))
    .text((d) => `${d.key} year olds`);

  endLabels
    .append('text')
    .attr('x', size.width - margin.right)
    .attr(
      'y',
      (d, i) => y(d.values[d.values.length - 1].pct) + 16 + (i === 2 ? -20 : i === 3 ? 12 : 0),
    )
    .text((d) => `${Math.round(d.values[d.values.length - 1].pct * 100)}%`)
    .attr('alignment-baseline', 'middle');

  const hoverOver = svg.append('g');

  const makeLine = (dat) => {
    hoverOver.selectAll('*').remove();

    hoverOver
      .append('line')
      .attr('x1', x(dat[0].date))
      .attr('x2', x(dat[0].date))
      .attr('y1', y(0))
      .attr('y2', y(d3.max(dat, (d) => +d.pct)))
      .attr('stroke-width', 2)
      .attr('stroke', 'black')
      .style('stroke-dasharray', '3, 3');

    const pts = hoverOver.selectAll('points').data(dat).join('g').style('pointe-events', 'none');
    pts
      .append('circle')
      .attr('r', 4)
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(+d.pct));

    const flip = x(dat[0].date) > size.width / 2;

    pts
      .append('text')
      .text((d) => `${Math.round(+d.pct * 10000) / 100}%`)
      .attr('y', (d) => y(+d.pct))
      .attr('x', (d) => x(d.date) + (flip ? -5 : 5))
      .attr('text-anchor', flip ? 'end' : 'start')
      .attr('alignment-baseline', 'middle');

    hoverOver
      .append('text')
      .text(
        `${d3.timeFormat('%B')(dat[0].date)} ${+d3.timeFormat('%d')(dat[0].date)}, ${+d3.timeFormat(
          '%Y',
        )(dat[0].date)}`,
      )
      .attr('x', x(dat[0].date) + (flip ? -5 : 5))
      .attr('y', y(d3.max(dat, (d) => +d.pct)) - 10)
      .attr('text-anchor', flip ? 'end' : 'start')
      .attr('pointer-events', 'none');
  };

  svg.on('mouseenter touchstart', () => {
    svg.on('mousemove touchout', (event) => {
      const mouseX = d3.pointer(event)[0];

      const xVal = x.invert(mouseX);

      const closestTime = d3.timeParse('%m/%d/%Y')(d3.timeFormat('%m/%d/%Y')(xVal)).getTime();

      const closestPoints = data.map((d1) => d1.values.find((d) => d.date.getTime() === closestTime));

      if (closestPoints && closestPoints[0]) {
        makeLine(closestPoints);
      }
      lines.attr('stroke-opacity', 0.2);
    });

    svg.on('mouseleave touchend', () => {
      lines.attr('stroke-opacity', 1);
      hoverOver.selectAll('*').remove();
    });
  });
};

export default makePlot;
