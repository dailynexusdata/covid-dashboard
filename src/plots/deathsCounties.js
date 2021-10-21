/**
 * @file CA County deaths
 *
 * @author alex rudolph
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
 *
 * @param {*} data
 *
 * @author alex rudolph
 *
 * @since 8/9/2021
 */
const makePlot = (container, data) => {
  const maxWidth = container.node().parentNode.parentNode.clientWidth;

  const size = {
    height: 400,
    width: maxWidth > 950 ? maxWidth / 2 - 10 : Math.min(600, window.innerWidth - 40),
  };
  const margin = {
    left: 10,
    top: 30,
    right: 80,
    bottom: 25,
  };

  container.style('width', `${size.width}px`);

  const nestedData = d3Collection
    .nest()
    .key((d) => d.county)
    .entries(data);

  const svg = container.append('svg').attr('width', size.width).attr('height', size.height);
  container
    .append('p')
    .style('font-size', '10pt')
    .html(
      "Source: <a href='https://data.chhs.ca.gov/'>California Health and Human Services Agency</a>",
    );
  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);
  const y = d3
    .scaleLinear()
    .domain([0, Math.ceil(d3.max(data, (d) => d.pct) * 1000) / 1000])
    .range([size.height - margin.bottom, margin.top]);
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

  const horizLines = svg.append('g');

  y.ticks(4)
    .slice(1)
    .forEach((yVal, i) => {
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
        .text(yVal * 100000 + (i === 3 ? ' deaths per 100,000 people' : ''))
        .style('font-size', '12pt')
        .attr('fill', '#adadad')
        .attr('x', margin.left)
        .attr('y', y(yVal) - 5);
    });

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.pct));

  const color = (s) => {
    if (s === 'California') {
      // UGHHHHHHHHHHHHHHHHHHHHHHHHHHH
      // I DONT LIKE THIS COLOR
      return '#f28e2c'; // af7aa1;
    }
    if (s === 'Santa Barbara') {
      return '#4e79a7';
    }
    return '#A9A9A9';
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

  const endLabelsValues = firstLast(
    nestedData
      .map((d) => {
        const last = d.values[d.values.length - 1];
        return {
          ...last,
          pct: last.pct,
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
    .attr('x', (d) => x(d.date) + 5)
    .attr('y', (d) => y(d.pct))
    // .attr('text-anchor', 'end')
    .text((d) => d.county.split(' ')[0])
    .attr('fill', (d) => color(d.county));

  endLabels
    .append('text')
    .attr('x', (d) => x(d.date) + 5)
    .attr('y', (d, i) => y(d.pct) + 14)
    // .attr('text-anchor', 'end')
    .text((d) => {
      const [fr, ls] = d.county.split(' ');
      if (fr === 'California') {
        return 'Average';
      }
      return ls;
    })
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
      .style('left', `${Math.min(mouseX - width, size.width - width)}px`)
      .style('top', `${mouseY + 50}px`)
      .style('width', `${width}px`)
      .html(
        `${
          d.county === 'California' ? 'State Average' : `${d.county} County`
        }<hr style="border: none; border-top: 1px solid #d3d3d3; width: ${width * 0.95}px" />`
          + `${Math.round(d.pct * 10000000) / 100} deaths per 100,000 people`,
      )
      .style('pointer-events', 'none');
  });

  endLabels.on('mouseleave', (event, d) => {
    tooltip.style('display', 'none');
    tooltip.selectAll('*').remove();
  });
};

/**
 *
 * @param {*} data
 *
 * @author alex rudolph
 *
 * @since 8/9/2021
 */
const deathsCounties = (data) => {
  const container = d3.select('#deathsByCounty-d3').style('position', 'relative');
  container.selectAll('*').remove();

  container.append('h2').text('Total Deaths by County');

  const sbData = data.filter((d) => d.county === 'Santa Barbara');
  const caData = data.filter((d) => d.county === 'California');
  const diff = caData[caData.length - 1].pct - sbData[sbData.length - 1].pct;

  container
    .append('p')
    .text(
      `Santa Barbara County has a rate of ${Math.round(
        sbData[sbData.length - 1].pct * 100000,
      )} deaths per 100,000 people, which is ${Math.round(
        diff * 100000,
      )} deaths per 100,000 people less than the state average.`,
    );

  makePlot(container, data);
};

export default deathsCounties;
