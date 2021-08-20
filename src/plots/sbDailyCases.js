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
  const container = d3.select('#sbCounty-dailyCases-d3');

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container.append('h1').text('Daily Cases in Santa Barbara County');

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

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  container
    .append('a')
    .text('Source: __________')
    .attr('href', '');

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
    .style('font-family', 'Helvetica Neue,Helvetica,Arial,sans-serif')
    .style('font-size', '12pt')
    .attr('transform', `translate(0, ${size.height - margin.bottom})`)
    .call(
      d3
        .axisBottom()
        .scale(x)
        .tickFormat((d) => {
          const t = d3.timeFormat('%b \'%g')(d);
          return t;
        }),

    );

  console.log(y.ticks(3).slice(1));
  /*
     Start Plot:
   */
  data.forEach((yVal) => {

  });
};
export default makeDailyCases;
