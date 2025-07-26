/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";

import theme from "./theme";
import {
  chromosomeNames,
  chromosomesWithCumulativeLengths,
  SIGNIFICANCE,
} from "~/utils";

const maxPos =
  chromosomesWithCumulativeLengths[chromosomesWithCumulativeLengths.length - 1]
    .cumulativeLength;

const totalLength = chromosomesWithCumulativeLengths.reduce((acc, ch) => {
  return acc + ch.length;
}, 0);

const getXTicks = (x) => {
  const [start, end] = x.domain();
  const chRange = findChRange(x.domain());
  if (!chRange || !chRange.length) {
    return [start, (start + end) / 2, end];
  }
  if (chRange.length === 1) {
    return [start, (start + end) / 2];
  }
  const ticks = [start, (start + chRange[0].cumulativeLength) / 2];
  for (let i = 1; i < chRange.length - 1; i++) {
    const chromosome = chRange[i];
    ticks.push(chromosome.cumulativeLength - chromosome.length);
    ticks.push(chromosome.cumulativeLength - chromosome.length / 2);
  }
  const lastCh = chRange[chRange.length - 1];
  ticks.push(lastCh.cumulativeLength - lastCh.length);
  ticks.push((lastCh.cumulativeLength - lastCh.length + end) / 2);
  return ticks;
};

const getX2Ticks = () => {
  const ticks = [];
  chromosomesWithCumulativeLengths.forEach((ch) => {
    const chStart = ch.cumulativeLength - ch.length;
    const chMiddle = chStart + ch.length / 2;
    ticks.push(chStart);
    ticks.push(chMiddle);
  });
  return ticks;
};

const x2Ticks = getX2Ticks();

const findChRange = (range) => {
  const [start, end] = range;
  const chStart = chromosomesWithCumulativeLengths.findIndex(
    (ch) =>
      ch.cumulativeLength - ch.length <= start && start < ch.cumulativeLength
  );
  const chEnd = chromosomesWithCumulativeLengths.findIndex(
    (ch) => ch.cumulativeLength - ch.length < end && end <= ch.cumulativeLength
  );
  const chRange = [];
  for (let i = chStart; i <= chEnd; i++) {
    chRange.push(chromosomesWithCumulativeLengths[i]);
  }
  return chRange;
};

const getChromosomeName = (pos) => {
  const chromosome = chromosomesWithCumulativeLengths.find(
    (ch) => ch.cumulativeLength - ch.length <= pos && pos < ch.cumulativeLength
  );
  return chromosome ? chromosome.name : "";
};

const customXAxis = (g, axis) => {
  g.call(axis);
  g.selectAll(".tick:nth-child(odd) line").remove();
  g.selectAll(".tick:nth-child(even) text").remove();
  g.selectAll(".tick text")
    .attr("fill", theme.axis.color)
    .attr("font-size", 12);
  g.selectAll(".domain, .tick line").attr("stroke", theme.axis.color);
};

const customYAxis = (g, axis) => {
  g.call(axis);
  g.selectAll(".tick text").attr("fill", theme.axis.color);
  g.selectAll(".domain, .tick line").attr("stroke", theme.axis.color);
};

const OUTER_HEIGHT = 430;
const OUTER_HEIGHT2 = 95;
const margin = { top: 20, right: 20, bottom: 30, left: 80 };
const margin2 = { top: 20, right: 20, bottom: 30, left: 80 };
const height = OUTER_HEIGHT - margin.top - margin.bottom;
const height2 = OUTER_HEIGHT2 - margin2.top - margin2.bottom;

const ManhattanPlot = ({
  associations,
  credibleSets,
  tableColumns,
  studyId,
  onZoom,
  listTooltip: ListTooltip,
}) => {
  const svgRef = useRef();
  const svg2Ref = useRef();
  const clipRef = useRef();
  const sigLineRef = useRef();
  const brushRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const x2AxisRef = useRef();
  const containerRef = useRef();
  const d3Instances = useRef({});

  const [width, setWidth] = useState(900);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipAnchor, setTooltipAnchor] = useState(null);
  const [tooltipData, setTooltipData] = useState([]);

  const [isAssocView, setIsAssocView] = useState(false);
  const [viewData, setViewData] = useState(credibleSets);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const newWidth = entries[0].contentRect.width;
        setWidth(newWidth);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleMouseOver = useCallback(
    (event, data) => {
      if (!tableColumns) return;
      const anchorData = tableColumns(studyId).map(
        ({ id, label, renderCell }) => ({
          label,
          value: renderCell ? renderCell(data) : data[id],
        })
      );
      setTooltipAnchor(event.currentTarget);
      setTooltipData(anchorData);
      setTooltipOpen(true);
    },
    [studyId, tableColumns]
  );

  useEffect(() => {
    if (isAssocView) {
      if (viewData === credibleSets) {
        setViewData(associations);
      }
    } else {
      setViewData(credibleSets);
    }
  }, [isAssocView, associations, credibleSets, viewData]);

  useEffect(() => {
    d3Instances.current.x = d3.scaleLinear();
    d3Instances.current.x2 = d3.scaleLinear();
    d3Instances.current.y = d3.scaleLinear();
    d3Instances.current.y2 = d3.scaleLinear();

    d3Instances.current.xAxis = d3
      .axisBottom(d3Instances.current.x)
      .tickFormat((d) => getChromosomeName(d));
    d3Instances.current.yAxis = d3.axisLeft(d3Instances.current.y);
    d3Instances.current.x2Axis = d3
      .axisBottom(d3Instances.current.x2)
      .tickValues(x2Ticks)
      .tickFormat((d, i) => chromosomeNames[Math.floor(i / 2)]);
  }, []);

  useEffect(() => {
    if (
      !viewData ||
      viewData.length === 0 ||
      width <= 0 ||
      !d3Instances.current.x
    )
      return;

    const { x, x2, y, y2, xAxis, yAxis, x2Axis } = d3Instances.current;
    const innerWidth = width - margin.left - margin.right;

    x.range([0, innerWidth]);
    x2.range([0, innerWidth]).domain([0, totalLength]);
    const maxY = d3.max(viewData, (d) => -Math.log10(d.pval)) || 0;
    y.domain([0, maxY * 1.1]).range([height, 0]);
    y2.domain(y.domain()).range([height2, 0]);

    const svg = d3.select(svgRef.current);
    const svg2 = d3.select(svg2Ref.current);
    const focus = svg.select(".focus");
    const context = svg2.select(".context");

    d3.select(clipRef.current).attr("width", innerWidth);
    d3.select(sigLineRef.current)
      .attr("y1", y(SIGNIFICANCE))
      .attr("x2", innerWidth)
      .attr("y2", y(SIGNIFICANCE));

    context.selectAll(".chromosome-bands").remove();
    const colorBands = context
      .insert("g", ":first-child")
      .attr("class", "chromosome-bands");
    colorBands
      .selectAll("rect")
      .data(chromosomesWithCumulativeLengths)
      .join("rect")
      .attr("x", (d) => x2(d.cumulativeLength - d.length))
      .attr("y", 0)
      .attr(
        "width",
        (d) => x2(d.cumulativeLength) - x2(d.cumulativeLength - d.length)
      )
      .attr("height", height2)
      .style("fill", (d, i) =>
        i % 2 === 0 ? theme.track.background : theme.track.backgroundAlternate
      );

    const barGroups = focus
      .selectAll("g.dot-group")
      .data(viewData, (d) => d.id || d.indexVariantId);
    barGroups.exit().remove();
    const barsEnter = barGroups.enter().append("g").attr("class", "dot-group");

    barsEnter.selectAll("*").remove();

    if (isAssocView) {
      barsEnter.append("circle").attr("r", 4).attr("fill", "black");
      barsEnter
        .append("rect")
        .style("cursor", "pointer")
        .attr("fill", theme.line.color)
        .on("mouseover", handleMouseOver);
    } else {
      barsEnter
        .append("circle")
        .style("cursor", "pointer")
        .attr("r", 4)
        .attr("fill", "black")
        .on("click", (event, d) => {
          const selectedSet = associations.filter(
            (assoc) => assoc.tag === d.indexVariantId
          );
          if (selectedSet.length > 0) {
            setIsAssocView(true);
            setViewData(selectedSet);
          }
        });
    }

    const allGroups = barsEnter.merge(barGroups);
    allGroups
      .select("rect")
      .attr("x", (d) => x(d.globalPosition) - 1)
      .attr("width", 2)
      .attr("y", (d) => y(-Math.log10(d.pval)))
      .attr("height", (d) => y(0) - y(-Math.log10(d.pval)));
    allGroups
      .select("circle")
      .attr("cx", (d) => x(d.globalPosition))
      .attr("cy", (d) => y(-Math.log10(d.pval)));

    context
      .selectAll("rect.point")
      .data(viewData, (d) => d.id || d.indexVariantId)
      .join("rect")
      .attr("class", "point")
      .attr("width", 2)
      .attr("y", (d) => y2(-Math.log10(d.pval)))
      .attr("height", (d) => y2(0) - y2(-Math.log10(d.pval)))
      .attr("x", (d) => x2(d.globalPosition))
      .attr("fill", theme.line.color);

    d3.select(xAxisRef.current).call(customXAxis, xAxis);
    d3.select(yAxisRef.current).call(customYAxis, yAxis);
    d3.select(x2AxisRef.current).call(customXAxis, x2Axis);
  }, [viewData, width, handleMouseOver]);

  useEffect(() => {
    if (!d3Instances.current.x || width <= 0) return;

    const svg = d3.select(svgRef.current);
    const svg2 = d3.select(svg2Ref.current);
    const innerWidth = width - margin.left - margin.right;

    const drawChromosomeBands = (scale) => {
      const svg = d3.select(svgRef.current);
      svg.selectAll(".chromosome-bands").remove();

      const bandsGroup = svg
        .insert("g", ".focus")
        .attr("class", "chromosome-bands")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
      bandsGroup
        .selectAll("rect")
        .data(chromosomesWithCumulativeLengths)
        .join("rect")
        .attr("y", -10)
        .attr("height", 5)
        .attr("fill", (d, i) => colorScale(i))
        .attr("x", (d) => scale(d.cumulativeLength - d.length))
        .attr(
          "width",
          (d) =>
            scale(d.cumulativeLength) - scale(d.cumulativeLength - d.length)
        );
    };

    const brushed = (event) => {
      if (event.sourceEvent && event.sourceEvent.type === "zoom") return;
      setTooltipOpen(false);

      const { x, x2, zoom, xAxis } = d3Instances.current;
      const selection = event.selection || x2.range();
      const [start, end] = selection.map((pos) => x2.invert(pos));
      x.domain([start, end]);

      const focus = svg.select(".focus");
      focus
        .selectAll("g.dot-group")
        .select("circle")
        .attr("cx", (d) => x(d.globalPosition));
      focus
        .selectAll("g.dot-group")
        .select("rect")
        .attr("x", (d) => x(d.globalPosition) - 1);

      drawChromosomeBands(x);
      xAxis.tickValues(getXTicks(x));
      d3.select(xAxisRef.current).call(customXAxis, xAxis);

      svg.call(
        zoom.transform,
        d3.zoomIdentity
          .scale(innerWidth / (selection[1] - selection[0]))
          .translate(-selection[0], 0)
      );
      if (onZoom) onZoom(start, end);
    };

    const zoomed = (event) => {
      if (event.sourceEvent && event.sourceEvent.type === "brush") return;
      setTooltipOpen(false);

      const { x, x2, brush, xAxis } = d3Instances.current;
      const transform = event.transform;
      const xZoom = transform.rescaleX(x2);
      x.domain(xZoom.domain());

      const focus = svg.select(".focus");
      focus
        .selectAll("g.dot-group")
        .select("circle")
        .attr("cx", (d) => x(d.globalPosition));
      focus
        .selectAll("g.dot-group")
        .select("rect")
        .attr("x", (d) => x(d.globalPosition) - 1);

      drawChromosomeBands(x);
      xAxis.tickValues(getXTicks(x));
      d3.select(xAxisRef.current).call(customXAxis, xAxis);

      svg2
        .select(".brush")
        .call(brush.move, x.range().map(transform.invertX, transform));
      const [start, end] = x.domain();
      if (onZoom) onZoom(start, end);
    };

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [innerWidth, height2],
      ])
      .on("brush end", brushed);
    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .extent([
        [0, 0],
        [innerWidth, height],
      ])
      .on("zoom", zoomed);

    d3Instances.current.brush = brush;
    d3Instances.current.zoom = zoom;

    d3.select(brushRef.current).call(brush);
    svg.call(zoom);

    drawChromosomeBands(d3Instances.current.x);

    return () => {
      brush.on("brush end", null);
      zoom.on("zoom", null);
      d3.select(brushRef.current).on(".brush", null);
      svg.on(".zoom", null);
    };
  }, [width, onZoom]);

  const handleCredibleSetView = () => setIsAssocView((prev) => !prev);
  const handleMouseLeave = () => setTooltipOpen(false);
  const handleBackButtonClick = () => setIsAssocView(false);

  return (
    <>
      {isAssocView && (
        <button
          className="bg-black text-white rounded-md px-4 py-2 mb-4 mr-3"
          onClick={handleBackButtonClick}
        >
          Back to Credible Sets
        </button>
      )}
      <span style={{ color: "black" }}>View Variant Data</span>
      <input
        type="checkbox"
        checked={isAssocView}
        onChange={handleCredibleSetView}
      />
      <p style={{ color: "black" }}>
        Current View: {isAssocView ? "Variants" : "Credible Sets"}
      </p>

      <div ref={containerRef} onMouseLeave={handleMouseLeave}>
        <svg
          ref={svgRef}
          width={width}
          height={OUTER_HEIGHT}
          style={{ cursor: "move" }}
        >
          <defs>
            <clipPath id="clip">
              <rect ref={clipRef} height={height} />
            </clipPath>
          </defs>
          <g
            className="focus"
            transform={`translate(${margin.left}, ${margin.top})`}
            clipPath="url(#clip)"
          >
            <line ref={sigLineRef} x1="0" stroke={theme.secondary} />
          </g>
          <g
            ref={xAxisRef}
            transform={`translate(${margin.left}, ${
              OUTER_HEIGHT - margin.bottom
            })`}
          />
          <g
            ref={yAxisRef}
            transform={`translate(${margin.left}, ${margin.top})`}
          />
          <text
            x="40"
            y="200"
            transform="rotate(-90 40,200)"
            fill={theme.axis.color}
            fontSize="12"
          >
            -log₁₀(p-value)
          </text>
        </svg>

        <svg ref={svg2Ref} width={width} height={OUTER_HEIGHT2}>
          <g
            className="context"
            transform={`translate(${margin2.left}, ${margin2.top})`}
          >
            <g className="brush" ref={brushRef} />
            <g ref={x2AxisRef} transform={`translate(0, ${height2})`} />
          </g>
        </svg>

        {ListTooltip && (
          <ListTooltip
            open={tooltipOpen}
            anchorEl={tooltipAnchor}
            dataList={tooltipData}
          />
        )}
      </div>
    </>
  );
};

ManhattanPlot.displayName = "ManhattanPlot";
export default ManhattanPlot;
