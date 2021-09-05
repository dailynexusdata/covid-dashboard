/**
 * @file CA County testing rates
 *
 * @author alex rudolph
 * @author zach
 *
 * @since 8/3/2021
 */
import * as d3 from 'd3';
import * as d3Collection from 'd3-collection';

const firstLast = (arr) => {
  if (!arr.length) {
    return [];
  }
  const vals = [
    arr[0],
    arr[arr.length - 1],
    ...arr.filter((d) => ['California', 'Santa Barbara'].includes(d.county)),
  ];
  return vals.sort((a, b) => a.pct - b.pct);
};

/**
 * Plotting function
 *
 * @param {*} data - data/ca_vaccines.csv with date and cumulative individual doses converted
 * @param {*} accessor - function to get value from individual date point
 * @param {*} container - div for title + plot
 * @param {string} title - plot title
 *
 * @author alex rudolph
 * @todo add hover over events
 * @author zach
 * @todo add xaxis
 * @todo add ylabels
 *
 * @since 8/3/2021
 */
const makeVaccineCountySingle = (data, accessor, container, title, y, size, margin) => {
  container.append('h3').text(title);

  const nestedData = d3Collection
    .nest()
    .key((d) => d.county)
    .entries(data);

  const svg = container.append('svg').attr('width', size.width).attr('height', size.height);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(accessor(d) / d.population));
  const yticks = d3.range(0, y.domain()[1] + 0.2, 0.2);
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
      .text(d3.format('.0%')(yVal))
      .style('font-size', '10pt')
      .attr('fill', '#adadad')
      .attr('x', margin.left)
      .attr('y', y(yVal) - 5);
  });
  const color = (s) => {
    if (s === 'California') {
      // UGHHHHHHHHHHHHHHHHHHHHHHHHHHH
      // I DONT LIKE THIS COLOR
      return '#f28e2c'; // af7aa1;
    }
    if (s === 'Santa Barbara') {
      return '#4e79a7';
    }
    return '#d3d3d3';
  };

  svg
    .selectAll('lines')
    .data(
      nestedData.sort((a, b) => {
        if (a.key === 'Santa Barbara') {
          return 1;
        }
        if (b.key === 'Santa Barbara') {
          return -1;
        }
        if (a.key === 'California') {
          return 1;
        }
        if (b.key === 'California') {
          return -1;
        }
        return 0;
      }),
    )
    .enter()
    .append('path')
    .attr('d', (d) => line(d.values))
    .attr('stroke', (d) => color(d.key))
    .attr('stroke-width', (d) => (['California', 'Santa Barbara'].includes(d.key) ? 3 : 1))
    .attr('stroke-opacity', (d) => (['California', 'Santa Barbara'].includes(d.key) ? 1 : 0.5))
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
        .ticks(4)
        .tickFormat((d) => {
          const t = d3.timeFormat('%b')(d);
          return t === 'Jan' ? `${t} '21` : t;
        }),
    );

  const endLabelsValues = firstLast(
    nestedData
      .map((d) => {
        const last = d.values[d.values.length - 1];

        return {
          ...last,
          pct: accessor(last) / last.population,
        };
      })
      .sort((a, b) => a.pct - b.pct),
  );

  const endLabels = svg.selectAll('endLabs').data(endLabelsValues).join('g');

  endLabels
    .append('circle')
    .attr('cx', (d) => x(d.date))
    .attr('cy', (d) => y(d.pct))
    .attr('r', 3)
    .attr('fill', (d) => color(d.county));

  endLabels
    .append('text')
    .attr('x', (d) => x(d.date))
    .attr('y', (d, i) => y(d.pct) + (i >= 2 ? -5 : 15) + (i === 1 ? 15 : 0))
    .attr('text-anchor', 'end')
    .text((d) => d.county + (d.county === 'California' ? ' Average' : ''))
    .attr('fill', (d) => color(d.county));

  const tooltip = container
    .append('div')
    .style('display', 'none')
    .style('pointer-events', 'none')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '10px')
    .style('border-radius', '10px')
    .style('border', '1px solid #d3d3d3');
  endLabels.on('mousemove', (event, d) => {
    const [mouseX, mouseY] = d3.pointer(event);

    const width = 170;

    tooltip.selectAll('*').remove();
    tooltip
      .style('display', 'block')
      .style('left', `${Math.min(mouseX - width / 2, size.width - width)}px`)
      .style('top', `${mouseY + 30}px`)
      .style('width', `${width}px`)
      .html(
        `${
          d.county === 'California' ? 'State Average' : `${d.county} County`
        }<hr style="border: none; border-top: 1px solid #d3d3d3;" />`
          + `Percentage: ${Math.round(d.pct * 1000) / 10}%`,
      )
      .style('pointer-events', 'none');
  });

  endLabels.on('mouseleave', (event, d) => {
    tooltip.style('display', 'none');
    tooltip.selectAll('*').remove();
  });
};

const makeVaccineCounty = (data) => {
  const container = d3
    .select('#dosesByCounty-d3')
    .style('width', Math.min(750, window.innerWidth - 40));
  container.selectAll('*').remove();

  container.append('h1').text('Santa Barbara County Vaccinations');

  container.append('p').text('here is stuff');

  const plots = container
    .append('div')
    .style('display', 'flex')
    .style('flex-wrap', 'wrap')
    .style('justify-content', 'space-between')
    .style('margin-top', '10px');
  const atLeastOne = plots.append('div').style('position', 'relative');
  const fully = plots.append('div').style('position', 'relative');

  container
    .append('p')
    .html(
      "Source: <a href='https://data.chhs.ca.gov/'>California Health and Human Services Agency</a>",
    );
  const size = {
    height: 400,
    width: window.innerWidth > 700 ? 350 : window.innerWidth - 40,
  };
  const margin = {
    left: 10,
    top: 50,
    right: 10,
    bottom: 30,
  };

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.cumulative_at_least_one_dose / d.population))
    .range([size.height - margin.bottom, margin.top]);

  makeVaccineCountySingle(
    data,
    (d) => d.cumulative_at_least_one_dose,
    atLeastOne,
    'At Least One Dose',
    y,
    size,
    margin,
  );
  makeVaccineCountySingle(
    data,
    (d) => d.cumulative_fully_vaccinated,
    fully,
    'Fully Vaccinated',
    y,
    size,
    margin,
  );
};

export default makeVaccineCounty;
