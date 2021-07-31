import * as d3 from "d3";

import makeVaccineTypes from "./vaccineTypes";

(async () => {
  const convertTime = d3.timeParse("%Y-%m-%d");

  const vaccineData = await d3.csv("dist/data/vaccines.csv");
  vaccineData.forEach((d) => {
    d["date"] = convertTime(d["date"]);
    d.cumulative_pfizer_doses = +d.cumulative_pfizer_doses;
    d.cumulative_moderna_doses = +d.cumulative_moderna_doses;
    d.cumulative_jj_doses = +d.cumulative_jj_doses;
  });

  window.addEventListener("resive", () => {
    resize();
  });

  const resize = () => {
    makeVaccineTypes(vaccineData);
  };

  resize();
})();
