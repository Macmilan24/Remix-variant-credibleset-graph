import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import path from "path";

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      serverDependenciesToBundle: [
        "@material-ui/core",
        "@material-ui/icons",
        "d3",
        "d3-array",
        "d3-axis",
        "d3-brush",
        "d3-color",
        "d3-dispatch",
        "d3-drag",
        "d3-ease",
        "d3-format",
        "d3-interpolate",
        "d3-scale",
        "d3-selection",
        "d3-shape",
        "d3-time",
        "d3-time-format",
        "d3-timer",
        "d3-transition",
        "d3-zoom",
        "polished",
        "react-measure",
      ],
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
  },
});
