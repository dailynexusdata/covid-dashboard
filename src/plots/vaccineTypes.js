/**
 * @file Pfizer, Moderna, Johnson&Johnson cumulative administered doses in SB County.
 *
 * @author alex rudolph
 * @author zach
 *
 * @since 7/30/2021
 */
import * as d3 from 'd3';

/**
 * Shows single vaccine doses administered
 *
 * @param {*} div - div for the specific vaccine plot
 * @param {*} data - array of daily data for vaccine numbers
 // eslint-disable-next-line max-len
 * @param {Function} getValue - get the cumulative number of doses from a single item in data, returns the value for the specified vaccine
 * @param {string} title - vaccine name
 * @param {string} color - color to use for curve
 * @param {number} yMax - max range value for y scale
 *
 * @author alex rudolph
 * @complete show curves with colors
 * @author zach
 * @todo x-axis, see link below for formatting
 * @todo y-lines with labels above -- get the values by .ticks(n).slice(1) -- see in example belows
 * @todo mouse-over read values and dashed line
 *
 * @see {@link https://github.com/dailynexusdata/kcsb-covid/blob/main/plots/ucsbTesting.js see how to do mouse events}
 * @see {@link https://dailynexusdata.github.io/kcsb-covid/vaccines for how it should end up looking (just 1 curve)}, {@link https://github.com/dailynexusdata/kcsb-covid/blob/main/plots/countyVaccines.js for source}
 *
 *  @since 7/30/2021
 */

const numberWithCommas = d3.format('.0s');

const makeSinglePlot = (div, data, getValue, title, color, yMax) => {
  const size = {
    width: 250,
    height: 250,
  };
  const margin = {
    top: 20,
    left: 10,
    bottom: 30,
    right: 10,
  };

  div.style('margin', '10px 0');

  div.append('h3').text(`Total ${title} Doses`).style('margin', '0 0 0 5px');

  const svg = div.append('svg');
  svg.attr('width', size.width).attr('height', size.height);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const yticks = d3.range(0, yMax + 100000 - 1, 100000);

  const y = d3
    .scaleLinear()
    .domain([0, yticks[yticks.length - 1]])
    .range([size.height - margin.bottom, margin.top]);

  const curve = svg.selectAll('curve').data([data]).join('g');

  const line = curve
    .append('path')
    .attr(
      'd',
      d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(+getValue(d))),
    )
    .attr('stroke', color)
    .attr('stroke-width', 3)
    .attr('fill', 'none');

  const area = curve
    .append('path')
    .attr(
      'd',
      d3
        .area()
        .x((d) => x(d.date))
        .y0(y(0))
        .y1((d) => y(+getValue(d))),
    )
    .attr('fill-opacity', 0.4)
    .attr('fill', color);

  // yticks
  // you can do a .forEach to add both a horizontal line and the text above on the line
  svg
    .append('g')
    .style('color', '#adadad')
    .style('font-size', '12pt')
    .attr('transform', `translate(0, ${size.height - margin.bottom})`)
    .call(
      d3
        .axisBottom()
        .scale(x)
        .ticks(4)
        .tickFormat((d) => {
          const t = d3.timeFormat('%b')(d);

          return t === 'Jan' ? `${t}'21` : t;
        }),
    );

  const horizLines = svg.append('g');

  yticks.slice(1).forEach((yVal) => {
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
      .text(numberWithCommas(yVal))
      .style('font-size', '10pt')
      .attr('fill', '#adadad')
      .attr('x', margin.left)
      .attr('y', y(yVal) - 5);
  });

  curve.raise();
  // if you want to change the styles on the line or area
  // such as for mouse over events use lin.attr("", ...) or area.attr("", ...)
};

/**
 * Shows percentage breakdown of each vaccine
 *
 * @param {*} div
 * @param {{width: number, height: number}} size - plotting area dimensions
 * @param {*} data - total number of doses at most recent date
 * @param {*} colors - dictionary for vaccine color
 * @param {*} labels - dictionary for vaccine label name
 *
 * @author alex rudolph
 *
 * @since 8/7/2021
 */
const vaccinePct = (div, size, data, colors, labels) => {
  const plotData = { ...data };
  delete plotData.date;

  const total = d3.sum(Object.keys(labels).map((key) => plotData[key]));

  Object.keys(plotData).forEach((key) => {
    plotData[key] /= total;
  });

  const stacked = d3
    .stack()
    .keys([
      'cumulative_pfizer_doses',
      'cumulative_moderna_doses',
      'cumulative_jj_doses',
    ])([plotData]);

  const margin = {
    left: 0,
    top: 10,
    right: 0,
    botom: 10,
  };

  const svg = div.append('svg');

  svg.attr('height', size.height).attr('width', size.width);

  const x = d3.scaleLinear().range([margin.left, size.width - margin.right]);

  const y = size.height / 2;

  const bars = svg
    .selectAll('rect')
    .data(stacked.map((d) => ({ ...d[0], key: d.key })))
    .join('g');

  bars
    .append('rect')
    .attr('x', (d) => x(d[0]))
    .attr('width', (d) => x(d[1]) - x(d[0]))
    .attr('y', y)
    .attr('height', 20)
    .attr('fill', (d) => colors[d.key])
    .attr('fill-opacity', 0.8);

  bars
    .append('text')
    .attr('x', (d, i) => {
      if (i !== 2) {
        return x(d[0]) + 5;
      }
      return x(d[1]);
    })
    .attr('y', y + 11)
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'white')
    .style('font-weight', 'bold')
    .style('text-anchor', (_, i) => ['start', 'start', 'end'][i])
    .text((d) => `${Math.round((d[1] - d[0]) * 100)}%`);

  bars
    .append('text')
    .attr('x', (d, i) => {
      if (i !== 2) {
        return x(d[0]) + 5;
      }
      return x(d[1]);
    })
    .attr('y', y - 5)
    .attr('fill', (d) => colors[d.key])
    .style('font-weight', 'bold')
    .style('text-anchor', (_, i) => ['start', 'start', 'end'][i])
    .text((d) => labels[d.key]);
};

/**
 * Manages all 3 individual dose plots
 *
 * @param {*} data - data/vaccines.csv with date and cumulative individual doses converted
 *
 * @author alex rudolph
 *
 * @since 8/7/2021
 */
const makeVaccineTypes = (data) => {
  const container = d3.select('#dosesByVaccine-d3');
  container.selectAll('*').remove();

  container.append('h1').text('Santa Barbara County Vaccinations');

  container.append('p').text('here is stuff');

  const barArea = container
    .append('div')
    .style('width', container.style('width'));

  container.append('p').text('here is stuff');
  const plotArea = container
    .append('div')
    .style('display', 'flex')
    .style('justify-content', 'center')
    .style('flex-wrap', 'wrap');

  container.append('p').html("Source: <a href='https://google.com'>test</a>");

  const colors = {
    cumulative_pfizer_doses: '#4e79a7',
    cumulative_moderna_doses: '#f28e2c',
    cumulative_jj_doses: '#76b7b2',
  };

  const labels = {
    cumulative_pfizer_doses: 'Pfizer',
    cumulative_moderna_doses: 'Moderna',
    cumulative_jj_doses: 'J&J',
  };

  vaccinePct(
    barArea,
    {
      height: 50,
      width: +container.style('width').slice(0, -2),
    },
    data[data.length - 1],
    colors,
    labels,
  );

  const yMax = Math.max(
    data[data.length - 1].cumulative_moderna_doses,
    data[data.length - 1].cumulative_pfizer_doses,
  );

  const pfizerDiv = plotArea.append('div');
  makeSinglePlot(
    pfizerDiv,
    data,
    (d) => d.cumulative_pfizer_doses,
    'Pfizer',
    colors.cumulative_pfizer_doses,
    yMax,
  );

  const modernaDiv = plotArea.append('div');
  makeSinglePlot(
    modernaDiv,
    data,
    (d) => d.cumulative_moderna_doses,
    'Moderna',
    colors.cumulative_moderna_doses,
    yMax,
  );

  const jjDiv = plotArea.append('div');
  makeSinglePlot(
    jjDiv,
    data,
    (d) => d.cumulative_jj_doses,
    'J&J',
    colors.cumulative_jj_doses,
    yMax,
  );
};

export default makeVaccineTypes;
