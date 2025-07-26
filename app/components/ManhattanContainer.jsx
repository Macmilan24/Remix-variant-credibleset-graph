/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { ListTooltip } from "~/ot-ui-components";
import { tableColumns } from "./ManhattanTable";

import { chromosomesWithCumulativeLengths } from "~/utils";
import Manhattan from "./Manhattan";

const maxPos =
  chromosomesWithCumulativeLengths[chromosomesWithCumulativeLengths.length - 1]
    .cumulativeLength;

function transformManhattanData(record) {
  if (!record) return [];
  return record.map((d) => {
    const { variant, ...rest } = d;
    const ch = chromosomesWithCumulativeLengths.find(
      (ch) => ch.name === variant.chromosome
    );
    return {
      ...rest,
      indexVariantId: variant.id,
      indexVariantRsId: variant.rsId,
      chromosome: variant.chromosome,
      position: variant.position,
      globalPosition: ch
        ? ch.cumulativeLength - ch.length + variant.position
        : null,
      nearestCodingGene: variant.nearestCodingGene,
    };
  });
}

function ManhattanContainer({ data, studyId, hasSumstats }) {
  const [associations, setAssociations] = useState([]);
  const [credibleSets, setCredibleSets] = useState([]);

  const [zoom, setZoom] = useState({ start: 0, end: maxPos });

  const manhattanPlot = useRef();

  useEffect(() => {
    if (data && data.manhattan) {
      const transformedAssociations = transformManhattanData(
        data.manhattan.associations
      );
      const transformedCredibleSets = transformManhattanData(
        data.manhattan.credibleSets
      );
      setAssociations(transformedAssociations);
      setCredibleSets(transformedCredibleSets);
    }
  }, [data]);

  const handleZoom = (start, end) => {
    if (start !== zoom.start || end !== zoom.end) {
      setZoom({ start, end });
    }
  };

  return (
    <React.Fragment>
      <Manhattan
        ref={manhattanPlot}
        associations={associations}
        credibleSets={credibleSets}
        tableColumns={tableColumns}
        studyId={studyId}
        onZoom={handleZoom}
        listTooltip={ListTooltip}
      />
    </React.Fragment>
  );
}

export default ManhattanContainer;
