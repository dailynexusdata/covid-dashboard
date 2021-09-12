/**
 * @author alex rudolph
 */

import * as d3 from 'd3';
import { nest } from 'd3-collection';

const makeRaces = (raceData) => {
  const container = d3.select('#vaccinesbyRace-d3');
  container.selectAll('*').remove();

  const data = nest()
    .key((d) => d.group)
    .entries(raceData);

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  container.style('width', `${size.width}px`);

  const margin = {
    top: 30,
    right: 122,
    bottom: 30,
    left: 10,
  };

  container.append('h2').text('Vaccinations by Race');

  const hoverArea = container.append('div').style('position', 'relative');
  const svg = hoverArea.append('svg').attr('height', size.height).attr('width', size.width);

  container
    .append('p')
    .style('font-size', '10pt')
    .html(
      "Source: <a href='https://data.chhs.ca.gov/'>California Health and Human Services Agency</a>",
    );

  const x = d3
    .scaleTime()
    .domain(d3.extent(data[0].values, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(raceData, (d) => d.pct))
    .range([size.height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.pct));

  const colors = d3.scaleOrdinal(d3.schemeCategory10);

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

  const yticks = y.ticks(4).slice(1);

  yticks.forEach((yVal, i) => {
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
      .text(`${yVal * 100}%${i === yticks.length - 1 ? ' partially vaccinated' : ''}`)
      .attr('fill', '#adadad')
      .attr('x', margin.left)
      .attr('y', y(yVal) - 5);
  });

  ylines.lower();

  const endLabels = svg.selectAll('endLabels').data(data).join('g');

  endLabels
    .append('text')
    .attr('font-weight', 'bold')
    .attr('x', size.width - margin.right)
    .attr('y', (d) => {
      if (d.key === 'White') {
        return y(d.values[0].pct) - 5;
      }

      if (d.key === 'Indigenous') {
        return y(d.values[0].pct) - 3;
      }

      return y(d.values[0].pct);
    })
    .attr('alignment-baseline', 'middle')
    .attr('fill', (d, i) => colors(i))
    .style('flex-wrap', 'wrap')
    .text((d) => `${d.key}: ${Math.round(d.values[0].pct * 100)}%`);

  // endLabels
  //   .append('text')
  //   .attr('x', size.width - margin.right)
  //   .attr(
  //     'y',
  //     (d) => y(d.values[d.values.length - 1].pct) + 20,
  //   )
  //   .text((d) => `${Math.round(d.values[d.values.length - 1].pct * 100)}%`)
  //   .attr('alignment-baseline', 'middle');

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
  context.font = '14pt Arial, Helvetica, sans-serif';
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

    // pts
    //   .append('text')
    //   .text((d) => `${Math.round(+d.pct * 10000) / 100}%`)
    //   .attr('y', (d) => y(+d.pct))
    //   .attr('x', (d) => x(d.date) + (flip ? -5 : 5))
    //   .attr('text-anchor', flip ? 'end' : 'start')
    //   .attr('alignment-baseline', 'middle');

    // hoverOver
    //   .append('text')
    //   .text(`${d3.timeFormat('%B %-d %Y')(dat[0].date)}`)
    //   .attr('x', x(dat[0].date) + (flip ? -5 : 5))
    //   .attr('y', y(d3.max(dat, (d) => +d.pct)) - 10)
    //   .attr('text-anchor', flip ? 'end' : 'start')
    //   .attr('pointer-events', 'none');

    tooltip.selectAll('*').remove();

    const mouseX = d3.pointer(event)[0];
    const dateText = `${d3.timeFormat('%B %-d, %Y')(dat[0].date)}`;

    dat = dat.map((d) => ({ ...d, label: `${d.group}: ${Math.round(d.pct * 10000) / 100}%` }));

    const wdth = d3.max(dat, (d) => context.measureText(d.label).width) + 5;

    const hght = y(d3.max(dat, (d) => d.pct));
    const maxHeight = 200;

    tooltip
      .style('width', wdth)
      .style('left', `${flip ? mouseX - wdth - 10 : mouseX + 10}px`)
      .style('top', `${Math.min(hght, maxHeight)}px`);
    tooltip.append('p').text(dateText);
    tooltip.append('hr').style('border', 'none').style('border-top', '1px solid #d3d3d3');

    dat
      .sort((a, b) => b.pct - a.pct)
      .forEach((d) => {
        tooltip.append('p').text(d.label);
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
      tooltip.style('display', 'none');
      hoverOver.selectAll('*').remove();
    });
  });
};

export default makeRaces;
