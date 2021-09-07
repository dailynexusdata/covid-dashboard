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
  container.style('width', `${size.width}px`);

  const margin = {
    top: 50,
    right: 80,
    bottom: 80,
    left: 80,
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

  const credArea = container.append('div');

  const updatedDate = data.features[0].properties.date;

  credArea
    .append('p')
    .html(
      "Source: <a href='https://data.chhs.ca.gov/'>"
        + `California Health and Human Services Agency. Updated ${d3.timeFormat('%B %-d, %Y')(
          updatedDate,
        )}.</a>`,
    );

  credArea.append('p').text('Chart: Bella Gennuso / Daily Nexus').style('font-style', 'italic');

  /**
   * Scales and projections:
   */

  const proj = d3
    .geoMercator()
    .fitSize(
      [size.width - 10 - margin.left - margin.right, size.height - margin.top - margin.bottom],
      data,
    );

  const projection = d3
    .geoMercator()
    .scale(proj.scale())
    .translate([proj.translate()[0] + 5 + margin.left, proj.translate()[1] + margin.top]);

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

  const scale = scaleContainer.append('svg').attr('width', size.width).attr('height', 40);

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

  scale.append('text').text('% vaccinated of zip code').attr('x', 15).attr('y', 12);

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
  const ivData = data.features.find((d) => ivZip === +d.properties.zip).properties;

  annotation.append('circle').attr('cx', endIV[0]).attr('cy', endIV[1]).attr('r', 4);
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
  const casmaliaAntonio = projection([-120.53769, 34.88595]);
  const casmaliaZip = 93429;
  const casData = data.features.find((d) => casmaliaZip === +d.properties.zip).properties;

  annotation
    .append('circle')
    .attr('cx', casmaliaAntonio[0])
    .attr('cy', casmaliaAntonio[1])
    .attr('r', 4);
  const casmaliaLine = -100 + (size.height < 400 ? 30 : 0);
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
    .text('Casmalia and Antonio have the')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', casmaliaAntonio[0] - 50)
    .attr('y', casmaliaAntonio[1] + casmaliaLine - 8 - 24);

  annotation
    .append('text')
    .text('lowest vaccination rate, with only')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', casmaliaAntonio[0] - 50)
    .attr('y', casmaliaAntonio[1] + casmaliaLine - 8 - 12);

  annotation
    .append('text')
    .text(`${Math.round(casData.vacPct * 100)}% vaccinated.`)
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', casmaliaAntonio[0] - 50)
    .attr('y', casmaliaAntonio[1] + casmaliaLine - 8);

  // highest zip
  // this is a really small shape - make sure we dont cover
  const carpinteria = projection([-119.59384, 34.42478]);
  const carpinteriaZip = 93067;
  const carpData = data.features.find((d) => carpinteriaZip === +d.properties.zip).properties;

  annotation
    .append('circle')
    .attr('cx', carpinteria[0] - 2)
    .attr('cy', carpinteria[1] - 2)
    .attr('r', 3);
  const carpinteriaLine = 100 + (size.height < 480 ? (size.height < 330 ? -20 : -10) : 0);

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
    .text('highest in the area')
    .attr('alignment-baseline', 'hanging')
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('x', carpinteria[0] - 25)
    .attr('y', carpinteria[1] - carpinteriaLine - 48 + 36);

  const tooltip = hoverArea
    .append('div')
    .style('display', 'none')
    .style('pointer-events', 'none')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '10px')
    .style('border-radius', '10px')
    .style('border', '1px solid #d3d3d3');

  cbs.on('mousemove', function (event, d) {
    d3.select(this).attr('stroke-width', 3);
    const [mouseX, mouseY] = d3.pointer(event);
    const width = 140;

    const comma = d3.format(',');

    tooltip.style('display', 'block');
    tooltip
      .style('width', `${width}px`)
      .style('left', `${Math.min(mouseX, size.width - width - 30)}px`)
      .style('top', `${mouseY}px`)
      .style('font-size', '10pt')
      .html(
        `<p>${d.properties.city.replace(/-/g, ', ')}</p>`
          + '<hr style="margin: 3px 0; border: none; border-top: 1px solid #d3d3d3;"/>'
          + `Zip Code: ${d.properties.zip}<br />`
          // + `Pop. 16+: ${comma(d.properties.pop12)}<br />`
          // + `# Vaccinated: ${comma(+d.properties.pop12 - +d.properties.zip_codes)}<br />`
          + `% vaccinated: ${Math.round(d.properties.vacPct * 1000) / 10}%`,
      );
  });

  cbs.on('mouseleave', function () {
    d3.select(this).attr('stroke-width', 1);
    tooltip.style('display', 'none');
  });
};

export default makePlot;
