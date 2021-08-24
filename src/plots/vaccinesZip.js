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
  // Add the same amount of height and margin.top
  // change the height at the end -- the +40
  const size = {
    height: Math.min(330, window.innerWidth - 40 * 2) + 40,
    width: Math.min(550, window.innerWidth - 40),
  };

  const container = d3
    .select('#vacByZipCode-d3')
    .style('width', `${size.width}px`);
  container.selectAll('*').remove();

  container
    .append('h1')
    .text('Santa Barbara County Vaccination Rate by Zip Code')
    .style('font-size', '20pt');
  // container.append('p').text('Race alone');
  const margin = {
    top: 30,
    right: 30,
    bottom: 45,
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
    .html('<p>Source: Santa Barbara Public Health 7/20/2021.</p>');

  // container
  //   .append('div')
  //   .html('<p>Source: Santa Barbara Public Health 7/20/2021.</p>');

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
    .attr('width', 100)
    .attr('height', size.width / 2);

  const axisX = d3.scaleLinear().range([size.width / 2 - 55, 35]);
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
    .text('% vaccinated')
    .attr('x', '50%')
    .attr('y', '12')
    .attr('text-anchor', 'middle');

  scale
    .append('text')
    .text('100%')
    .attr('x', '50%')
    .attr('y', 35)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle');

  scale
    .append('text')
    .text('0%')
    .attr('x', '50%')
    .attr('y', size.width / 2 - 28)
    .attr('alignment-baseline', 'middle')
    .attr('text-anchor', 'middle');

  scale
    .append('g')
    .selectAll('bars')
    .data(barDom)
    .enter()
    .append('rect')
    .attr('y', (d1) => axisX(d1.x0))
    .attr('height', 10)
    .attr('x', 100 / 2 - 5)
    .attr('width', 10)
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
  const endIVyOffset = 35; // height of line
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
    .text('The zip code containing Goleta, Isla Vista, Gaviota,')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('x', endIV[0] - 40)
    .attr('y', endIV[1] + endIVyOffset);

  annotation
    .append('text')
    .text(
      `Naples and Capitan have a vaccination rate of ${Math.round(
        ivData.vacPct * 100,
      )}%.`,
    )
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('x', endIV[0] - 40)
    .attr('y', endIV[1] + endIVyOffset + 12);

  // lowest zip
  const casmaliaAntonio = projection([-120.5375, 34.88004]);
  const casmaliaZip = 93429;
  const casData = data.features.find(
    (d) => casmaliaZip === +d.properties.zip,
  ).properties;

  annotation
    .append('circle')
    .attr('cx', casmaliaAntonio[0])
    .attr('cy', casmaliaAntonio[1])
    .attr('r', 4);
  const casmaliaLine = -105;
  annotation
    .append('line')
    .attr('x1', casmaliaAntonio[0])
    .attr('x2', casmaliaAntonio[0])
    .attr('y1', casmaliaAntonio[1])
    .attr('y2', casmaliaAntonio[1] + casmaliaLine)
    .style('stroke-dasharray', '1, 2')
    .style('stroke', 'black');

  annotation
    .append('text')
    .text('Casmalia and Antonio have the lowest vaccination rate, ')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', casmaliaAntonio[0] - 40)
    .attr('y', casmaliaAntonio[1] + casmaliaLine - 8 - 12);

  annotation
    .append('text')
    .text(`with only ${Math.round(casData.vacPct * 100)}% vaccinated.`)
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', casmaliaAntonio[0] - 40)
    .attr('y', casmaliaAntonio[1] + casmaliaLine - 8);

  // highest zip
  // this is a really small shape - make sure we dont cover
  const carpinteria = projection([-119.61122, 34.42019]);
  const carpinteriaZip = 93067;
  const carpData = data.features.find(
    (d) => carpinteriaZip === +d.properties.zip,
  ).properties;

  annotation
    .append('circle')
    .attr('cx', carpinteria[0] - 2)
    .attr('cy', carpinteria[1] - 2)
    .attr('r', 3);
  const carpinteriaLine = 90;

  annotation
    .append('line')
    .attr('x1', carpinteria[0] - 2)
    .attr('x2', carpinteria[0])
    .attr('y1', carpinteria[1] - 2)
    .attr('y2', carpinteria[1] - carpinteriaLine)
    .style('stroke-dasharray', '1, 2')
    .style('stroke', 'black');

  annotation
    .append('text')
    .text('The zip code for')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', carpinteria[0] - 25)
    .attr('y', carpinteria[1] - carpinteriaLine - 48);

  annotation
    .append('text')
    .text(`Carpinteria has ${Math.round(carpData.vacPct * 100)}%`)
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', carpinteria[0] - 25)
    .attr('y', carpinteria[1] - carpinteriaLine - 48 + 12);

  annotation
    .append('text')
    .text('people vaccinated, the')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', carpinteria[0] - 25)
    .attr('y', carpinteria[1] - carpinteriaLine - 48 + 24);

  annotation
    .append('text')
    .text('highest in the area.')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', carpinteria[0] - 25)
    .attr('y', carpinteria[1] - carpinteriaLine - 48 + 36);
};

export default makePlot;
