/**
 * @author alex rudolph
 */
import * as d3 from 'd3';

const data = [
  {
    area: 'Isla Vista',
    active: 29,
    recovered: 1457,
    deaths: 1,
  },
  {
    area: 'Goleta',
    active: 50,
    recovered: 1973,
    deaths: 29,
  },
  {
    area: 'City of Santa Barbara',
    active: 133,
    recovered: 6847,
    deaths: 99,
  },
];

const makePlot = () => {
  const container = d3.select('#print-overview-table');
  container.selectAll('*').remove();

  const columns = Object.keys(data[0]);

  const table = container
    .append('table')
    .style('border-collapse', 'collapse')
    .style('margin', '10px');

  container.append('p').text('Source: Santa Barbara County Public Health');

  // .style('background-color', '#d3d3d3');

  table
    .selectAll('headers')
    .append('tr')
    .data(columns)
    .enter()
    .append('th')
    .text((d) => d[0].toUpperCase() + d.slice(1))
    .style('text-align', 'left')
    .style('border-bottom', '1px solid black')
    .style('padding', '5px 10px')
    .filter((d, i) => i > 0)
    .style('border-left', '1px dotted black')
    .style('text-align', 'right');

  table
    .selectAll('rows')
    .data(data)
    .enter()
    .append('tr')
    .style('background-color', (d) =>
      d.area === 'Isla Vista' ? '#d3d3d3' : 'none',
    )
    .selectAll('dat')
    .data((d) => Object.entries(d))
    .enter()
    .append('td')
    .text((d) => d[1])
    .style('padding', '5px 10px')
    .filter((d, i) => i > 0)
    .style('text-align', 'right')
    .style('border-left', '1px dotted black');
};

export default makePlot;
