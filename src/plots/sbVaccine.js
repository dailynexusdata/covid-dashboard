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
const sbVaccines = (data) => {
  const container = d3.select('#sbCouty-vaccines-d3');

  // columns we want:
  // > date
  // > cumulative_at_least_one_dose
  // > cumulative_fully_vaccinated
  // you dont have to filter the other out -- just use these
  console.log(data);
};

export default sbVaccines;
