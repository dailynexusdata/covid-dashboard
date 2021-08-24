/**
 * @author alex rudolph
 */
import * as d3 from 'd3';
import { schemeGnBu } from 'd3';

const makePlot = (data) => {
  const container = d3.select('#print-iv-cases');
  container.selectAll('*').remove();

  const size = {
    height: 1200,
    width: 600,
  };

  const margin = {
    top: 10,
    right: 350,
    bottom: 10,
    left: 20,
  };

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  container.append('p').text('Source: Santa Barbara County Public Health');
  const y = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.top, size.height - margin.bottom]);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.cases))
    .range([size.width - margin.right, margin.left]);
  console.log(data, x.range(), y.range(), x.domain(), y.domain());

  const path = d3
    .line()
    .x((d) => x(d.avg))
    .y((d) => y(d.date))
    .curve(d3.curveCatmullRom);

  const barWidth = 1;
  svg
    .selectAll('bars')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.cases))
    .attr('width', (d) => size.width - margin.right - x(d.cases))
    .attr('y', (d) => y(d.date) - barWidth / 2)
    .attr('height', barWidth)
    .attr('fill', 'red');

  svg
    .datum(data)
    .append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 2);

  const times = d3.timeFormat('%b');

  svg
    .append('g')
    .style('color', '#adadad')
    .style('font-size', '12pt')
    .attr('transform', `translate(${size.width - margin.right}, 0)`)
    .call(
      d3
        .axisRight()
        .scale(y)
        .ticks(6)
        .tickFormat((d, i) => {
          const t = times(d);
          return t === 'Jan' ? `${t} '21` : i === 0 ? `${t} '20` : t;
        }),
    )
    .lower();

  svg
    .append('text')
    .attr('x', size.width - margin.right + 8)
    .attr('y', 5)
    .attr('alignment-baseline', 'hanging')
    .text('New COVID-19 Cases in IV')
    .attr('fill', '#adadad')
    .attr('font-size', '20pt');

  svg
    .append('text')
    .attr('x', size.width - margin.right + 8)
    .attr('y', size.height - 5)
    .text('Source: Santa Barbara County Public Health')
    .attr('fill', '#adadad')
    .attr('font-size', '12pt');

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

  const lineLabel = (d) => {
    svg
      .append('line')
      .attr('y1', y(d.date) + 10)
      .attr('y2', y(d.date) - 10)
      .attr('x1', x(d.cases))
      .attr('x2', x(d.cases))
      .attr('stroke', '#adadad')
      .attr('stroke-dasharray', '3, 3');

    svg
      .append('text')
      .attr('y', y(d.date) + 12)
      .attr('alignment-baseline', 'hanging')
      .attr('x', x(d.cases))
      .attr('text-anchor', 'middle')
      .attr('fill', '#adadad')
      .text(d.cases);
  };

  const maxDate = data.find((d) => d.cases === 31);
  lineLabel(maxDate);

  const julPeak = data.find(
    (d) => d3.timeFormat('%Y-%m-%d')(d.date) === '2021-07-30',
  );
  lineLabel(julPeak);

  const aprPeak = data.find(
    (d) => d3.timeFormat('%Y-%m-%d')(d.date) === '2021-04-19',
  );
  lineLabel(aprPeak);

  const octPeak = data.find(
    (d) => d3.timeFormat('%Y-%m-%d')(d.date) === '2020-10-13',
  );
  lineLabel(octPeak);

  const julPeak2020 = data.find(
    (d) => d3.timeFormat('%Y-%m-%d')(d.date) === '2020-08-11',
  );
  lineLabel(julPeak2020);
};

export default makePlot;
