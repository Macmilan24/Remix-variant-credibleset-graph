import React from "react";
import { findDOMNode } from "react-dom";
import Grid from "@material-ui/core/Grid/index.js";
import Button from "@material-ui/core/Button/index.js";
import downloadSVG from "../helpers/downloadSVG";
import PlotContainer from "./PlotContainer";

// // any should be converted to a proper ref
const handleSVGDownload = (svgContainer: any, filenameStem: string) => {
  const node = findDOMNode(svgContainer.current);
  const svgNode = node.nodeName === "svg" ? node : node.querySelector("svg");
  downloadSVG({ svgNode, filenameStem });
};
// const handleSVGDownload = (svgContainerRef: React.RefObject<HTMLElement>, filenameStem: string) => {
//   if (!svgContainerRef.current) return;

//   const node = svgContainerRef.current;
//   const svgNode = node.nodeName.toLowerCase() === 'svg'
//     ? node
//     : node.querySelector('svg');

//   if (!svgNode) return;

//   downloadSVG({ svgNode, filenameStem });
// };

const DownloadSVGPlot = ({
  loading,
  error,
  left,
  center,
  svgContainer,
  filenameStem,
  reportDownloadEvent,
  children,
}: {
  loading: boolean;
  error: { graphQLErrors: { message: string }[] };
  left: React.ReactNode;
  center: React.ReactNode;
  children: React.ReactNode;
  filenameStem: string;
  svgContainer?: any;
  reportDownloadEvent?: () => void;
}) => (
  <PlotContainer
    loading={loading}
    error={error}
    left={left}
    center={center}
    right={
      <Grid container justifyContent="flex-end" spacing={8}>
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => {
              if (reportDownloadEvent) {
                reportDownloadEvent();
              }
              handleSVGDownload(svgContainer, filenameStem);
            }}
          >
            SVG
          </Button>
        </Grid>
      </Grid>
    }
  >
    {children}
  </PlotContainer>
);

export default DownloadSVGPlot;
