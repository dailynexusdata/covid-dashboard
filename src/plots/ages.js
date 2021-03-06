/**
 * @author alex rudolph
 */

import * as d3 from 'd3';
import { max } from 'd3';
import { nest } from 'd3-collection';

const makePlot = (d) => {
  const startDate = new Date(2020, 11, 1);
  const ageData = d.filter((d) => d.date.getTime() - startDate.getTime() > 0);

  const container = d3.select('#sbCounty-vaccine-ages');
  container.selectAll('*').remove();
  const maxWidth = container.node().parentNode.parentNode.clientWidth;

  const data = nest()
    .key((d) => d.group)
    .entries(ageData);

  const size = {
    height: 400,
    width: maxWidth > 950 ? maxWidth / 2 - 10 : Math.min(600, window.innerWidth - 40),
  };

  container.style('width', `${size.width}px`);

  const margin = {
    top: 30,
    right: 100,
    bottom: 30,
    left: 10,
  };

  container.append('h2').text('Vaccinations by Age Group');

  const lower = data[1].values[data[1].values.length - 1].pct;
  const upper = data[2].values[data[2].values.length - 1].pct;

  d3.select('#covid-dashboard-age-race-top-text')
    .append('p')
    .attr('class', 'covid-dashboard-article')
    .text(
      'In the beginning of April, 18 to 49-year-olds and 50 to 64-year-olds became eligible for the vaccine. However, '
        + `the 50 to 64-year-old group currently has a vaccination percentage that is ${Math.round(
          (upper - lower) * 100,
        )} percentage points higher than the 18 to 49-year-old group.`,
    );

  const hoverArea = container.append('div').style('position', 'relative');
  const svg = hoverArea.append('svg').attr('height', size.height).attr('width', size.width);

  // container
  //   .append('p')
  //   .style('font-size', '10pt')
  //   .html(
  //     "Source: <a href='https://data.chhs.ca.gov/'>California Health and Human Services Agency</a>",
  //   );

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
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  svg
    .append('g')
    .style('color', '#adadad')
    .style('font-size', '12pt')
    .attr('transform', `translate(0, ${size.height - margin.bottom})`)
    .call(
      d3
        .axisBottom()
        .scale(x)
        .ticks(window.innerWidth < 500 ? 4 : 6)
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
        .text(`${yVal * 100}%${i === 4 ? ' partially vaccinated' : ''}`)
        .attr('fill', '#adadad')
        .attr('x', margin.left)
        .attr('y', y(yVal) - 5);
    });

  ylines.lower();

  const endLabels = svg.selectAll('endLabels').data(data).join('g');

  endLabels
    .append('text')
    .attr('x', size.width - margin.right + 2)
    .attr('y', (d, i) => y(d.values[d.values.length - 1].pct) + (i === 2 ? -20 : i === 3 ? 12 : 0))
    .attr('alignment-baseline', 'middle')
    .attr('font-weight', 'bold')
    .attr('fill', (d, i) => colors(i))
    .text((d) => `Ages ${d.key}`);

  endLabels
    .append('text')
    .attr('x', size.width - margin.right + 2)
    .attr(
      'y',
      (d, i) => y(d.values[d.values.length - 1].pct) + 16 + (i === 2 ? -20 : i === 3 ? 12 : 0),
    )
    .text((d) => `${Math.round(d.values[d.values.length - 1].pct * 100)}%`)
    .attr('alignment-baseline', 'middle');

  const hoverOver = svg.append('g');

  const tooltip = hoverArea
    .append('div')
    .style('display', 'none')
    .style('pointer-events', 'none')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '10px')
    .style('border-radius', '10px')
    .style('border', '1px solid #d3d3d3');

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '12pt Arial, Helvetica, sans-serif';
  const makeLine = (event, dat) => {
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

    tooltip.selectAll('*').remove();

    const mouseX = d3.pointer(event)[0];
    const dateText = `${d3.timeFormat('%B %-d, %Y')(dat[0].date)}`;
    const wdth = context.measureText(dateText).width + 10;

    const hght = y(max(dat, (d) => d.pct));
    const maxHeight = 230;

    tooltip
      .style('width', wdth)
      .style('left', `${flip ? mouseX - wdth - 25 : mouseX + 10}px`)
      .style('top', `${Math.min(hght, maxHeight)}px`);
    tooltip.append('p').text(dateText);
    tooltip.append('hr').style('border', 'none').style('border-top', '1px solid #d3d3d3');

    dat
      .sort((a, b) => b.pct - a.pct)
      .forEach((d) => {
        tooltip.append('p').text(`${d.group}: ${Math.round(d.pct * 10000) / 100}%`);
      });
  };

  svg.on('mouseenter touchstart', () => {
    svg.on('mousemove touchout', (event) => {
      const mouseX = d3.pointer(event)[0];

      const xVal = x.invert(mouseX);

      const closestTime = d3.timeParse('%m/%d/%Y')(d3.timeFormat('%m/%d/%Y')(xVal)).getTime();

      const closestPoints = data.map((d1) => d1.values.find((d) => d.date.getTime() === closestTime));

      if (closestPoints && closestPoints[0]) {
        makeLine(event, closestPoints);
        tooltip.style('display', 'block');
      }
      lines.attr('stroke-opacity', 0.2);
    });

    svg.on('mouseleave touchend', () => {
      lines.attr('stroke-opacity', 1);
      hoverOver.selectAll('*').remove();
      tooltip.style('display', 'none');
    });
  });
};

export default makePlot;
