/**
 * @author alex rudolph
 */
import * as d3 from 'd3';

const makePlot = (data) => {
  const container = d3.select('#print-iv-cases');
  container.selectAll('*').remove();

  const size = {
    height: 200,
    width: Math.min(1400, window.innerWidth - 40),
  };

  const margin = {
    top: 10,
    right: 20,
    bottom: 30,
    left: 10,
  };
  container
    .append('h1')
    .text('New COVID-19 Cases in Isla Vista')
    .style('font-size', '20pt');
  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  container.append('p').text('Source: Santa Barbara County Public Health');
  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.cases))
    .range([size.height - margin.bottom, margin.top]);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  //   console.log(data, x.range(), y.range(), x.domain(), y.domain());

  y.ticks(3)
    .slice(1)
    .forEach((yHeight, i) => {
      svg
        .append('line')
        .attr('y1', y(yHeight))
        .attr('y2', y(yHeight))
        .attr('x1', margin.left)
        .attr('x2', size.width - margin.right)
        .attr('stroke', '#d3d3d3');

      svg
        .append('text')
        .text(yHeight + (i === 2 ? ' cases' : ''))
        .attr('x', margin.left)
        .attr('y', y(yHeight) - 2)
        .attr('fill', '#d3d3d3');
    });

  const path = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.avg))
    .curve(d3.curveCatmullRom);

  const barWidth = 2;
  svg
    .selectAll('bars')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.date) - barWidth / 2)
    .attr('width', barWidth)
    .attr('y', (d) => y(d.cases))
    .attr('height', (d) => size.height - margin.bottom - y(d.cases))
    .attr('fill', '#E15759')
    .attr('fill-opacity', 0.8);

  svg
    .datum(data)
    .append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 2);

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

  const lineLabel = (d) => {
    svg
      .append('line')
      .attr('x1', x(d.date) + 10)
      .attr('x2', x(d.date) - 10)
      .attr('y1', y(d.cases))
      .attr('y2', y(d.cases))
      .attr('stroke', '#adadad')
      .attr('stroke-dasharray', '3, 3');

    svg
      .append('text')
      .attr('y', y(d.cases))
      .attr('alignment-baseline', 'middle')
      .attr('x', x(d.date) + 12)
      .attr('text-anchor', 'start')
      .attr('fill', '#adadad')
      .text(d.cases);
  };

  // const maxDate = data.find((d) => d.cases === 31);
  // lineLabel(maxDate);

  // const julPeak = data.find(
  //   (d) => d3.timeFormat('%Y-%m-%d')(d.date) === '2021-07-30',
  // );
  // lineLabel(julPeak);

  // const aprPeak = data.find(
  //   (d) => d3.timeFormat('%Y-%m-%d')(d.date) === '2021-04-19',
  // );
  // lineLabel(aprPeak);

  // const octPeak = data.find(
  //   (d) => d3.timeFormat('%Y-%m-%d')(d.date) === '2020-10-13',
  // );
  // lineLabel(octPeak);

  // const julPeak2020 = data.find(
  //   (d) => d3.timeFormat('%Y-%m-%d')(d.date) === '2020-08-11',
  // );
  // lineLabel(julPeak2020);

  const newCasesDate = new Date(2020, 8 - 1, 1);

  svg
    .append('text')
    .attr('x', size.width - margin.right + 20)
    .attr('y', y(newCasesDate))
    .text('New Cases')
    .attr('font-weight', 'bold')
    .attr('fill', 'red');

  svg
    .append('defs:marker')
    .attr('id', 'covid-dashboard-iv-new')
    .attr('refX', 0)
    .attr('refY', 2)
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M 0 0 L 4 2 L 0 4 z')
    .attr('fill', 'red');

  svg
    .append('path')
    .attr(
      'd',
      `M ${size.width - margin.right + 10} ${y(newCasesDate) + 10} Q ${
        size.width - margin.right + 45
      } ${y(newCasesDate) + 30}, ${size.width - margin.right + 60} ${
        y(newCasesDate) + 5
      } `,
    )
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('marker-start', 'url(#covid-dashboard-iv-new)');

  const avgCases = new Date(2020, 4 - 1, 25);

  svg
    .append('text')
    .attr('x', size.width - margin.right + 20)
    .attr('y', y(avgCases))
    .text('7-day Average')
    .attr('font-weight', 'bold');

  svg
    .append('defs:marker')
    .attr('id', 'covid-dashboard-iv-avg')
    .attr('refX', 0)
    .attr('refY', 2)
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M 0 0 L 4 2 L 0 4 z')
    .attr('fill', 'black');

  svg
    .append('path')
    .attr(
      'd',
      `M ${size.width - margin.right + 10} ${y(avgCases) + 10} Q ${
        size.width - margin.right + 45
      } ${y(avgCases) + 30}, ${size.width - margin.right + 60} ${
        y(avgCases) + 5
      } `,
    )
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('marker-start', 'url(#covid-dashboard-iv-avg)');
};

export default makePlot;
