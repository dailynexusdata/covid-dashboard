/**
 *
 * @author alex
 * @author zach
 *
 * @since 8/8/2021
 */
import * as d3 from 'd3';

/**
 *
 * @param {*} data - plot data
 *
 * @author alex
 * @author zach
 * @todo copy over the other chart
 *
 * @see {@link https://dailynexusdata.github.io/kcsb-covid/} the first plot here is what we want to make
 * @see {@link https://github.com/dailynexusdata/kcsb-covid/blob/main/plots/countyVaccines.js} I would say just copy the majority of the code
 *
 * @since 8/8/2021
 */

const closeVaccines = () => {
  d3.selectAll('.vaccineLegends').style('opacity', 1);
  d3.selectAll('.vaccineLine').style('stroke-width', 5);
  d3.selectAll('.vaccineEndLabel').style('fill-opacity', 1);
  d3.selectAll('.vaccineArea').style('fill-opacity', 0.5);
  const hoverOver = d3.select('#vaccineHoverOver');
  hoverOver.style('fill-opacity', 1);
  hoverOver.style('stroke-opacity', 1);
};

// https://experience.arcgis.com/experience/030e625c69a04378b2756de161f82ef6
// Variant Surveillance

const makeSbVaccines = (data) => {
  const container = d3
    .select('#sbCounty-vaccines-d3')
    .style('margin', '0 10px')
    .style('width', `${Math.min(600, window.innerWidth - 40)}px`);

  container.selectAll('*').remove();

  container
    .append('h1')
    .text(
      `Santa Barbara County COVID-19 Vaccinations Through ${d3.timeFormat('%B %Y')(
        data[data.length - 1].date,
      )}`,
    );

  const vaccineLegend = container.append('div');
  const svg = container.append('svg').style('self-align', 'center');

  container
    .append('p')
    .html(
      "Source: <a href='https://data.chhs.ca.gov/'>California Health and Human Services Agency</a>",
    );

  const color = {
    Partial: '#E15759',
    Full: '#4E79A7',
  };

  const size = {
    width: Math.min(600, window.innerWidth - 40),
    height: 400,
  };

  const margin = {
    top: 30,
    bottom: 40,
    left: window.innerWidth > 500 ? 50 : 15,
    right: 50,
  };

  svg.selectAll('*').remove();

  svg.attr('width', size.width).attr('height', size.height);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const xAxisLine = svg
    .append('g')
    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif')
    .style('font-size', '12pt')
    .attr('transform', `translate(0, ${size.height - margin.bottom})`);

  xAxisLine.call(
    d3
      .axisBottom()
      .scale(x)
      // .tickValues([
      //   ...(size.width < 600
      //     ? [x.domain()[1]]
      //     : [x.domain()[0]]),
      //   ...x.ticks(),
      // ])
      .tickFormat((d) => {
        const t = d3.timeFormat('%b')(d);
        return t === 'Jan' ? `${t}'21` : t;
      }),
  );

  xAxisLine.select('.domain').attr('stroke-width', 0);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.singlePct)])
    .range([size.height - margin.bottom, margin.top]);

  const horizLines = svg.append('g');

  y.ticks(5)
    .slice(1)
    .forEach((yVal, i) => {
      horizLines
        .append('text')
        .text(`${yVal * 100}%${i === 5 ? ' of Total County Population' : ''}`)
        .attr('fill', '#adadad')
        .attr('x', margin.left)
        .attr('y', y(yVal) - 5);

      horizLines
        .append('line')
        .attr('x1', margin.left)
        .attr('x2', size.width - margin.right)
        .attr('y1', y(yVal))
        .attr('y2', y(yVal))
        .attr('stroke', '#d3d3d3')
        .attr('stroke-width', '0.5px');
    });

  const singleArea = d3
    .area()
    .x((d) => x(d.date))
    .y0((d) => y(d.fullPct))
    .y1((d) => y(d.singlePct));

  const singleLine = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.singlePct));
  svg
    .append('g')
    .datum(data)
    .append('path')
    .attr('d', singleArea)
    .attr('class', 'vaccineArea')
    .attr('id', 'vaccine-partial')
    .attr('fill', color.Partial)
    .attr('fill-opacity', 0.5);

  svg
    .append('g')
    .datum(data)
    .append('path')
    .attr('class', 'vaccineLine')
    .attr('id', 'vaccineLine-partial')
    .attr('d', singleLine)
    .attr('stroke', color.Partial)
    .attr('stroke-width', 5)
    .attr('fill', 'none');

  const fullArea = d3
    .area()
    .x((d) => x(d.date))
    .y0(y(0))
    .y1((d) => y(d.fullPct));

  const fullLine = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.fullPct));

  svg
    .append('g')
    .datum(data)
    .append('path')
    .attr('d', fullArea)
    .attr('class', 'vaccineArea')
    .attr('id', 'vaccine-full')
    .attr('fill', color.Full)
    .attr('fill-opacity', 0.5);

  svg
    .append('g')
    .datum(data)
    .append('path')
    .attr('d', fullLine)
    .attr('class', 'vaccineLine')
    .attr('id', 'vaccineLine-full')
    .attr('stroke', color.Full)
    .attr('stroke-width', 5)
    .attr('fill', 'none');

  const endText = (xPos, text, yPos, color, lab) => {
    svg
      .append('text')
      .attr('class', 'vaccineEndLabel')
      .attr('id', `endLabel-${lab}`)
      .text(`${Math.round(text * 100)}%`)
      .attr('x', x(xPos) + 5)
      .attr('y', y(yPos))
      .attr('fill', color)
      .style('font-size', '16pt')
      .style('font-weight', 'bold')
      .style('alignment-baseline', 'middle');
  };

  const lastData = data[data.length - 1];
  endText(lastData.date, lastData.singlePct, lastData.singlePct, color.Partial, 'partial');
  endText(lastData.date, lastData.fullPct, lastData.fullPct, color.Full, 'full');
  // endText(
  //   lastData.date,
  //   lastData.singlePct - lastData.fullPct,
  //   (lastData.fullPct + lastData.singlePct) / 2,
  //   "#adadad"
  // );

  // const peakDate = new Date(2021, 4 - 1, 17);
  // const peakData = data.find(
  //   ({ date }) => date.getTime() === peakDate.getTime()
  // );
  // hoverOver
  //   .append("line")
  //   .attr("x1", x(peakDate))
  //   .attr("x2", x(peakDate))
  //   .attr("y1", y(peakData.fullPct))
  //   .attr("y2", y(peakData.singlePct))
  //   .attr("stroke-width", 2)
  //   .attr("stroke", "black")
  //   .style("stroke-dasharray", "3, 3");
  // hoverOver
  //   .append("line")
  //   .attr("x1", x(peakDate) - 50)
  //   .attr("x2", x(peakDate))
  //   .attr("y1", y(peakData.singlePct))
  //   .attr("y2", y(peakData.singlePct))
  //   .attr("stroke-width", 2)
  //   .attr("stroke", "black")
  //   .style("stroke-dasharray", "3, 3");

  // hoverOver
  //   .append("text")
  //   .attr("x", x(peakDate) - 50)
  //   .attr("y", y(peakData.singlePct) - 5)
  //   .text("hello 2");
  const createLine = (d) => {
    svg.selectAll('.vaccineHoverArea').remove();
    const hoverArea = svg.append('g').attr('class', 'vaccineHoverArea');
    hoverArea
      .append('line')
      .attr('x1', x(d.date))
      .attr('x2', x(d.date))
      .attr('y1', y(0))
      .attr('y2', y(d.singlePct))
      .attr('stroke-width', 2)
      .attr('stroke', 'black')
      .style('stroke-dasharray', '3, 3');
    hoverArea
      .append('circle')
      .attr('cx', x(d.date))
      .attr('cy', y(d.fullPct))
      .attr('r', 3)
      .attr('stroke-width', 2)
      .attr('stroke', 'black');
    hoverArea
      .append('circle')
      .attr('cx', x(d.date))
      .attr('cy', y(d.singlePct))
      .attr('r', 3)
      .attr('stroke-width', 2)
      .attr('stroke', 'black');
    if (window.innerWidth > 400) {
      hoverArea
        .append('text')
        .text(`Fully Vaccinated: ${Math.round(d.fullPct * 10000) / 100}%`)
        .attr('x', x(d.date) + (x(d.date) > size.width / 2 ? -5 : 5))
        .attr('y', y(d.fullPct))
        .attr('text-anchor', x(d.date) > size.width / 2 ? 'end' : 'start')
        .attr('alignment-baseline', 'middle');
      hoverArea
        .append('text')
        .text(`Partially Vaccinated: ${Math.round((d.singlePct - d.fullPct) * 10000) / 100}%`)
        .attr('x', x(d.date) + (x(d.date) > size.width / 2 ? -5 : 5))
        .attr('y', y(d.singlePct))
        .attr('text-anchor', x(d.date) > size.width / 2 ? 'end' : 'start')
        .attr('alignment-baseline', 'middle');
    } else {
      hoverArea
        .append('text')
        .text('Fully Vaccinated:')
        .attr('x', x(d.date) + (x(d.date) > size.width / 2 ? -5 : 5))
        .attr('y', y(d.fullPct) - 16)
        .attr('text-anchor', x(d.date) > size.width / 2 ? 'end' : 'start')
        .attr('alignment-baseline', 'middle');
      hoverArea
        .append('text')
        .text(`${Math.round(d.fullPct * 1000) / 10}%`)
        .attr('x', x(d.date) + (x(d.date) > size.width / 2 ? -5 : 5))
        .attr('y', y(d.fullPct))
        .attr('text-anchor', x(d.date) > size.width / 2 ? 'end' : 'start')
        .attr('alignment-baseline', 'middle');
      hoverArea
        .append('text')
        .text('Partially Vaccinated:')
        .attr('x', x(d.date) + (x(d.date) > size.width / 2 ? -5 : 5))
        .attr('y', y(d.singlePct) - 16)
        .attr('text-anchor', x(d.date) > size.width / 2 ? 'end' : 'start')
        .attr('alignment-baseline', 'middle');
      hoverArea
        .append('text')
        .text(`${Math.round((d.singlePct - d.fullPct) * 1000) / 10}%`)
        .attr('x', x(d.date) + (x(d.date) > size.width / 2 ? -5 : 5))
        .attr('y', y(d.singlePct))
        .attr('text-anchor', x(d.date) > size.width / 2 ? 'end' : 'start')
        .attr('alignment-baseline', 'middle');
    }
    hoverArea
      .append('text')
      .text(
        `${d3.timeFormat('%B')(d.date)} ${+d3.timeFormat('%d')(d.date)}, ${d3.timeFormat('%Y')(
          d.date,
        )}`,
      )
      .attr('x', x(d.date) + (x(d.date) > size.width / 2 ? -5 : 5))
      .attr('y', y(d.singlePct) - 16)
      .attr('text-anchor', x(d.date) > size.width / 2 ? 'end' : 'start')
      .attr('alignment-baseline', 'middle');
  };
  svg.on('mouseenter touchstart', () => {
    svg.on('mousemove touchout', (event) => {
      // hoverOver.style('fill-opacity', 0);
      // hoverOver.style('stroke-opacity', 0);
      d3.selectAll('.vaccineLine').style('stroke-width', 0.2);
      d3.selectAll('.vaccineArea').style('fill-opacity', 0.2);
      const mouseX = d3.pointer(event)[0];

      const xVal = x.invert(mouseX);

      // ill make a better thing later
      const closestPoint = data.reduce((best, curr) => {
        if (
          Math.abs(best.date.getTime() - xVal.getTime())
          < Math.abs(curr.date.getTime() - xVal.getTime())
        ) {
          return best;
        }
        return curr;
      });
      createLine(closestPoint);
    });

    svg.on('mouseleave touchend', () => {
      closeVaccines();
      svg.selectAll('.vaccineHoverArea').remove();
    });
  });

  const legend = vaccineLegend.style('width', '100%');

  legend.selectAll('*').remove();

  legend
    .append('p')
    .html(
      "County percentage of<span class='squares'></span>and<span class='squares'></span>residents including adults and children.",
    )
    .style('display', 'black')
    .style('line-height', '18pt')
    .style('margin', '0px')
    .style('letter-spacing', 'normal !important')
    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif');

  legend
    .selectAll('.squares')
    .data(['Partial', 'Full'])
    // .style("text-transform", "capitalize")
    .style('text-decoration', 'underline')
    .style('text-decoration-color', (d) => color[d])
    .style('text-decoration-thickness', '0.2em')
    .style('text-underline-offset', '0.2em')
    .attr('class', 'vaccineLegends')
    .text((d) => `${d.toLowerCase()}${d === 'Full' ? '' : 'l'}y vaccinated`)
    .style('padding', '5px')
    .style('-webkit-user-select', 'none')
    .style('user-select', 'none')
    .on('mouseover touchstart', function (event, d) {
      d3.selectAll('.vaccineLegends').style('opacity', 0.2);
      d3.selectAll('.vaccineLine').style('stroke-width', 0);
      d3.selectAll('.vaccineEndLabel').style('fill-opacity', 0.2);
      d3.selectAll('.vaccineArea').style('fill-opacity', 0.2);

      d3.select(this).style('opacity', 1);
      d3.select(`#vaccine-${d.toLowerCase()}`).style('fill-opacity', 0.5);
      d3.select(`#vaccineLine-${d.toLowerCase()}`).style('stroke-width', 5);
      d3.select(`#endLabel-${d.toLowerCase()}`).style('fill-opacity', 1);

      // hoverOver.style('fill-opacity', 0.2);
      // hoverOver.style('stroke-opacity', 0.2);
    })
    .on('mouseleave touchend touchcancel', () => {
      closeVaccines();
    });

  // svg.on("mousemove", function (event) {
  //   const mouse = d3.pointer(event);

  //   const date = x.invert(mouse[0]);
  //   const bisect = d3.bisector((d) => d.date).right;
  //   const idx = bisect(d.values, date);

  //   console.log(idx);
  // });
};

export default makeSbVaccines;
