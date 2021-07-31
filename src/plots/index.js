import * as d3 from "d3";
import "./styles.scss";

import makeVaccineTypes from "./vaccineTypes";

(async () => {
  const convertTime = d3.timeParse("%Y-%m-%d");

  const vaccineData = await d3.csv(
    "https://raw.githubusercontent.com/dailynexusdata/covid-dashboard/main/dist/data/vaccines.csv",
    (d) => {
      return {
        date: convertTime(d.date),
        cumulative_pfizer_doses: +d.cumulative_pfizer_doses,
        cumulative_moderna_doses: +d.cumulative_moderna_doses,
        cumulative_jj_doses: +d.cumulative_jj_doses,
      };
    }
  );
  console.log(vaccineData.columns);

  window.addEventListener("resive", () => {
    resize();
  });

  const resize = () => {
    makeVaccineTypes(vaccineData);
  };

  resize();
})();
