/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// plotly's prebuilt bundles ship without types; the notebook component only calls newPlot
declare module "plotly.js-cartesian-dist-min" {
  const Plotly: { newPlot: (el: HTMLElement, data: unknown[], layout?: object, config?: object) => Promise<unknown> };
  export default Plotly;
}
