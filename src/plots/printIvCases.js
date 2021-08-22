/**
 * @author alex rudolph
 */
import * as d3 from 'd3';

const makePlot = (data) => {
  const container = d3.select('#print-iv-cases');
  container.selectAll('*').remove();

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 10,
    right: 10,
    bottom: 30,
    left: 10,
  };

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.cases))
    .range([size.height - margin.bottom, margin.top]);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  //   console.log(data, x.range(), y.range(), x.domain(), y.domain());

  const path = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.avg))
    .curve(d3.curveCatmullRom);

  const barWidth = 1;
  svg
    .selectAll('bars')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.date) - barWidth / 2)
    .attr('width', barWidth)
    .attr('y', (d) => y(d.cases))
    .attr('height', (d) => size.height - margin.bottom - y(d.cases))
    .attr('fill', 'red')
    .attr('fill-opacity', 0.4);

  svg
    .datum(data)
    .append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 2);
  // .attr('stroke-opacity', 0.5);

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
        .text(`${yVal}${i === 5 ? ' of Total County Population' : ''}`)
        .attr('fill', '#adadad')
        .attr('x', margin.left)
        .attr('y', y(yVal) - 5);
    });

  ylines.lower();
  ylines.remove();
};

export default makePlot;
