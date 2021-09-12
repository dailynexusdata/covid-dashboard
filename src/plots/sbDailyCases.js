/**
 * Daily Case Tracker for Santa Barbara County
 *
 * @author alex
 *
 */
import * as d3 from 'd3';

/**
 * @param {*} data - dailyCases.csv
 *
 * @author Zach
 *
 * @since 08/19/2021
 */

const makeDailyCases = (data) => {
  /*
     Container Setup:
   */

  // The class is necessary to apply styling
  const container = d3
    .select('#sbCounty-dailyCases-d3')
    .style('width', `${Math.min(600, window.innerWidth - 40)}px`);

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container.append('h2').text('Daily Cases');

  const lastSevenDays = data.slice(-7);

  container
    .append('p')
    .text(
      `There have been ${d3.sum(
        lastSevenDays,
        (d) => d.cases,
      )} cases reported in the county since ${d3.timeFormat('%b. %-d, %Y.')(
        lastSevenDays[0].date,
      )}`,
    );

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 10,
    right: 10,
    bottom: 25,
    left: 10,
  };
  const hoverArea = container.append('div').style('position', 'relative');
  const svg = hoverArea.append('svg').attr('height', size.height).attr('width', size.width);
  container
    .append('p')
    .style('font-size', '10pt')
    .html(
      "Source: <a href='https://data.chhs.ca.gov/'>California Health and Human Services Agency</a>",
    );

  /*
     Create Scales:
   */

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.cases))
    .range([size.height - margin.bottom, margin.top]);

  // Axes
  svg
    .append('g')
    .style('color', '#adadad')
    .style('font-size', '12pt')
    .attr('transform', `translate(0, ${size.height - margin.bottom})`)
    .call(
      d3
        .axisBottom()
        .scale(x)
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
        .text(yVal + (i === 2 ? ' cases' : ''))
        .style('font-size', '12pt')
        .attr('fill', '#adadad')
        .attr('x', margin.left)
        .attr('y', y(yVal) - 5);
    });

  // Tooltip

  const tooltip = hoverArea
    .append('div')
    .style('display', 'none')
    .style('pointer-events', 'none')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '10px')
    .style('border-radius', '10px')
    .style('border', '1px solid #d3d3d3');
  /*
     Start Plot:
   */

  const barWidth = 1.5;

  const bars = svg
    .append('g')
    .attr('fill', '#85BDDEbb')
    .selectAll('bars')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.date) - barWidth / 2)
    .attr('width', barWidth)
    .attr('y', (d) => y(d.cases))
    .attr('height', (d) => size.height - margin.bottom - y(d.cases));

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.avg));

  svg
    .append('g')
    .datum(data)
    .append('path')
    .attr('d', line)
    .attr('stroke', '#D96942')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  const hoverCircle = svg.append('g');

  const labels = svg.append('g');

  labels
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'sbCounty-dailyCases-d3-triangle2')
    .attr('refX', 4)
    .attr('refY', 2)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 4 0 0 2 4 4')
    .attr('fill', '#D96942');

  const casesDate = d3.timeParse('%m-%d-%Y')('02-07-2021');
  const casesData = data.find((d) => d.date.getTime() === casesDate.getTime());

  labels
    .append('text')
    .text('7-day')
    .attr('class', 'tooltip')
    .attr('x', x(casesDate) + 55)
    .attr('y', y(casesData.avg) - 26)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14pt')
    .attr('fill', '#D96942')
    .attr('font-weight', 'bold');

  labels
    .append('text')
    .text('Average')
    .attr('class', 'tooltip')
    .attr('x', x(casesDate) + 55)
    .attr('y', y(casesData.avg) - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14pt')
    .attr('fill', '#D96942')
    .attr('font-weight', 'bold');
  labels
    .append('path')
    .attr(
      'd',
      `M ${x(casesDate) + 15} ${y(casesData.avg) + 10} Q ${x(casesDate) + 55} ${
        y(casesData.avg) + 10
      }, ${x(casesDate) + 55} ${y(casesData.avg) - 5}`,
    )
    .attr('fill', 'none')
    .attr('stroke', '#D96942')
    .attr('stroke-width', 2)
    .attr('marker-start', 'url(#sbCounty-dailyCases-d3-triangle2)');

  labels
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'sbCounty-dailyCases-d3-triangle1')
    .attr('refX', 4)
    .attr('refY', 2)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 4 0 0 2 4 4')
    .attr('fill', '#85BDDEbb');

  const avgDate = d3.timeParse('%m-%d-%Y')('05-04-2020');
  const avgData = data.find((d) => d.date.getTime() === avgDate.getTime());

  if (avgData === undefined) {
    return;
  }

  labels
    .append('text')
    .text('Cases')
    .attr('class', 'tooltip')
    .attr('x', x(avgDate) + 55)
    .attr('y', y(avgData.cases) - 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14pt')
    .attr('fill', '#85BDDEbb')
    .attr('font-weight', 'bold');
  labels
    .append('path')
    .attr(
      'd',
      `M ${x(avgDate) + 15} ${y(avgData.cases) + 10} Q ${x(avgDate) + 55} ${
        y(avgData.cases) + 10
      }, ${x(avgDate) + 55} ${y(avgData.cases) - 5}`,
    )
    .attr('fill', 'none')
    .attr('stroke', '#85BDDEbb')
    .attr('stroke-width', 2)
    .attr('marker-start', 'url(#sbCounty-dailyCases-d3-triangle1)');

  svg.on('mousemove', (event) => {
    const mouseX = d3.pointer(event)[0];

    const xVal = x.invert(mouseX);
    const closestTime = d3.timeParse('%m/%d/%Y')(d3.timeFormat('%m/%d/%Y')(xVal)).getTime();

    const closestPoint = data.find((d) => d.date.getTime() === closestTime);

    if (closestPoint === undefined) {
      return;
    }

    const tooltipWidth = 170;

    tooltip.style('display', 'block');
    tooltip
      .style('width', `${tooltipWidth}px`)
      .style(
        'left',
        `${Math.max(
          margin.left,
          Math.min(mouseX - tooltipWidth / 2, size.width - tooltipWidth - margin.right - 20),
        )}px`,
      )
      .style('top', `${y(closestPoint.avg) - 100}px`)
      .html(
        `<p>${d3.timeFormat('%B %-d, %Y')(
          closestPoint.date,
        )}</p><hr style="border: none; border-top: 1px solid #d3d3d3"/><p> Cases: ${
          closestPoint.cases
        }</p> <p> 7-day Average: ${d3.format(',.2f')(closestPoint.avg)}</p>`,
      );

    bars.attr('fill-opacity', 0.2);
    bars.filter((d) => d.date.getTime() === closestPoint.date.getTime()).attr('fill-opacity', 1);

    hoverCircle.selectAll('circle').remove();
    hoverCircle
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#D96942')
      .attr('cx', x(closestPoint.date))
      .attr('cy', y(closestPoint.avg));

    labels.attr('fill-opacity', 0);
    labels.attr('stroke-opacity', 0);
  });

  svg.on('mouseleave', function () {
    d3.select(this).attr('stroke-width', 1);
    tooltip.style('display', 'none');
    bars.attr('fill-opacity', 1);
    hoverCircle.selectAll('circle').remove();
    labels.attr('fill-opacity', 1);
    labels.attr('stroke-opacity', 1);
  });
};

export default makeDailyCases;
