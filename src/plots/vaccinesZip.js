/**
 * SB Area Vaccination % By Zip Code
 *
 * @author alex
 *
 * @since 8/17/2021
 */
import * as d3 from 'd3';

/**
 *
 * @param {*} data - GEOJSON map object
 *
 * @author alex
 * @TODO hover over map
 * @author Bella
 * @TODO add map labels
 */
const makePlot = (data) => {
  const container = d3.select('#vacByZipCode-d3');
  container.selectAll('*').remove();

  container.append('h1').text('IV and UCSB Demographics 2020');
  container.append('p').text('Race alone');

  // Add the same amount of height and margin.top
  // change the height at the end -- the +40
  const size = {
    height: Math.min(400, window.innerWidth - 40 * 2) + 40,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 50,
    right: 30,
    bottom: 80,
    left: 0,
  };

  const scaleContainer = container
    .append('div')
    .style('margin', '10px 0')
    .style('display', 'flex')
    .style('justify-content', 'center');

  const hoverArea = container
    .append('div')
    .style('position', 'relative')
    .style('display', 'flex')
    .style('justify-content', 'center');
  const svg = hoverArea.append('svg');

  container
    .append('div')
    .html('<p>Source: Santa Barbara Public Health 7/20/2021</p>');

  /**
   * Scales and projections:
   */

  const proj = d3
    .geoMercator()
    .fitSize(
      [
        size.width - 10 - margin.left - margin.right,
        size.height - margin.top - margin.bottom,
      ],
      data,
    );

  const projection = d3
    .geoMercator()
    .scale(proj.scale())
    .translate([
      proj.translate()[0] + 5 + margin.left,
      proj.translate()[1] + margin.top,
    ]);

  const path = d3.geoPath().projection(projection);

  /**
   * Map
   */
  svg.attr('height', size.height).attr('width', size.width);

  const colors = d3.scaleSequential(d3.interpolateRdYlGn);

  const cbs = svg
    .append('svg')
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('stroke', 'black')
    .attr('fill', (d) => colors(+d.properties.vacPct));

  /**
   * Legend:
   */

  const scale = scaleContainer
    .append('svg')
    .attr('width', size.width)
    .attr('height', 40);

  const axisX = d3.scaleLinear().range([45, size.width - 45]);
  const step = 1 / 20;
  const barDom = d3
    .range(0, 1 + step, step)
    .reduce(
      (acc, curr) => {
        const lastVal = acc[acc.length - 1].x1;
        return [...acc, { x0: lastVal, x1: curr }];
      },
      [{ x0: 0, x1: 0 }],
    )
    .slice(1);

  scale
    .append('text')
    .text('% of census block population')
    .attr('x', 15)
    .attr('y', '12');

  scale
    .append('text')
    .text('0%')
    .attr('x', axisX(0) - 5)
    .attr('y', 35)
    .attr('alignment-basline', 'middle')
    .attr('text-anchor', 'end');

  scale
    .append('text')
    .text('100%')
    .attr('x', axisX(1) + 5)
    .attr('y', 35)
    .attr('alignment-basline', 'middle');

  scale
    .selectAll('bars')
    .data(barDom)
    .enter()
    .append('rect')
    .attr('x', (d1) => axisX(d1.x0))
    .attr('width', (d1) => axisX(d1.x1) - axisX(d1.x0))
    .attr('y', 20)
    .attr('height', 20)
    .attr('fill', (d1) => colors(d1.x0));

  /**
   *
   * Plot Annotations:
   *
   */

  const annotation = svg.append('g');

  // IV LABEL::
  const endIV = projection([-119.92357, 34.4302]);
  const ivZip = 93117;
  const ivData = data.features.find(
    (d) => ivZip === +d.properties.zip,
  ).properties;

  // see what cities this includes:
  console.log(ivData);

  annotation
    .append('circle')
    .attr('cx', endIV[0])
    .attr('cy', endIV[1])
    .attr('r', 4);
  const endIVyOffset = 25; // height of line
  annotation
    .append('line')
    .attr('x1', endIV[0])
    .attr('x2', endIV[0])
    .attr('y2', endIV[1] + endIVyOffset)
    .attr('y1', endIV[1])
    .style('stroke-dasharray', '1, 2')
    .style('stroke', 'black');

  annotation
    .append('text')
    .text('The zip code containing')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('x', endIV[0] - 5)
    .attr('y', endIV[1] + endIVyOffset + 2);

  annotation
    .append('text')
    .text('Goleta, Isla Vista, Gaviota,')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('x', endIV[0] - 5)
    .attr('y', endIV[1] + endIVyOffset + 2 + 12);

  annotation
    .append('text')
    .text('Naples and Capitan have')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('x', endIV[0] - 5)
    .attr('y', endIV[1] + endIVyOffset + 2 + 24);

  annotation
    .append('text')
    .text(`a vaccination rate of ${Math.round(ivData.vacPct * 100)}%`)
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('x', endIV[0] - 5)
    .attr('y', endIV[1] + endIVyOffset + 2 + 36);

  // lowest zip
  const casmaliaAntonio = projection([-120.53769, 34.83195]);
  const casmaliaZip = 93429;

  // highest zip
  // this is a really small shape - make sure we dont cover
  const carpinteria = projection([-119.59384, 34.42478]);
  const carpinteriaZip = 93067;
};

export default makePlot;
