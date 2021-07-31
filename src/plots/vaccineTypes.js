/**
 * @file Pfizer, Moderna, Johnson&Johnson cumulative administered doses in SB County.
 *
 * @author alex rudolph
 * @author zach
 *
 * @since 7/30/2021
 */
import * as d3 from "d3";

/**
 * Shows single vaccine doses administered
 *
 * @param {*} div - div for the specific vaccine plot
 * @param {*} data - array of daily data for vaccine numbers
 * @param {Function} getValue - get the cumulative number of doses from a single item in data, returns the value for the specified vaccine
 * @param {string} title - vaccine name
 * @param {string} color - color to use for curve
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
const makeSinglePlot = (div, data, getValue, title, color) => {
  const size = {
    width: 200,
    height: 200,
  };
  const margin = { top: 10, left: 10, bottom: 10, right: 10 };

  div.append("h3").text(title);

  const svg = div.append("svg");
  svg.attr("width", size.width).attr("height", size.height);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, size.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, getValue))
    .range([size.height - margin.bottom, margin.top]);

  const curve = svg.selectAll("curve").data([data]).join("g");

  const line = curve
    .append("path")
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(+getValue(d)))
    )
    .attr("stroke", color)
    .attr("stroke-width", 3)
    .attr("fill", "none");

  const area = curve
    .append("path")
    .attr(
      "d",
      d3
        .area()
        .x((d) => x(d.date))
        .y0(y(0))
        .y1((d) => y(+getValue(d)))
    )
    .attr("fill-opacity", 0.4)
    .attr("fill", color);

  // yticks
  // you can do a .forEach to add both a horizontal line and the text above on the line
  console.log(y.ticks(5).slice(1));

  // if you want to change the styles on the line or area
  // such as for mouse over events use lin.attr("", ...) or area.attr("", ...)
};

/**
 * Manages all 3 individual dose plots
 *
 * @param {*} data - data/vaccines.csv with date and cumulative individual doses converted
 *
 * @author alex rudolph
 *
 * @since 7/30/2021
 */
const makeVaccineTypes = (data) => {
  const container = d3.select("#dosesByVaccine-d3");
  container.selectAll("*").remove();

  container.append("h1").text("plot title");

  const plotArea = container
    .append("div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("flex-wrap", "wrap");

  container.append("p").html("Source: <a href='https://google.com'>test</a>");

  //   const colors = d3.scaleOrdinal(d3.schemeTableau10);
  //   console.log(colors.range());

  const pfizerDiv = plotArea.append("div");
  makeSinglePlot(
    pfizerDiv,
    data,
    (d) => d.cumulative_pfizer_doses,
    "Pfizer",
    "#4e79a7"
  );

  const modernaDiv = plotArea.append("div");
  makeSinglePlot(
    modernaDiv,
    data,
    (d) => d.cumulative_moderna_doses,
    "Moderna",
    "#f28e2c"
  );

  const jjDiv = plotArea.append("div");
  makeSinglePlot(jjDiv, data, (d) => d.cumulative_jj_doses, "J&J", "#76b7b2");
};

export default makeVaccineTypes;
