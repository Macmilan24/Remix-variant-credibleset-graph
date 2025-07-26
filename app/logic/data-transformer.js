/* eslint-disable no-unused-vars */
export function convertCredibleSetsToManhattan(data) {
  const results = [];
  const cs_data = [];

  const variantGroups = data?.data || {};
  for (const [_variantKey, group] of Object.entries(variantGroups)) {
    const { credible_sets: credibleSets, metadata } = group || [];

    cs_data.push({
      variant: {
        id: _variantKey,
        rsId: null,
        chromosome: String(metadata.chr),
        position: metadata.position,
        nearestCodingGeneDistance: null,
        __typename: "Variant",
      },
      pval: metadata.lead_variant_pip,
      credibleSetSize: metadata.credible_set_size,
      __typename: "ManhattanAssociation",
    });

    credibleSets.forEach((set) => {
      const vars = set.variants?.data || {};
      const n = vars.variant?.length || 0;

      for (let i = 0; i < n; i++) {
        const chr = vars.chromosome[i];
        const pos = vars.position[i];
        const ref = vars.ref_allele[i];
        const variantStr = vars.variant[i];
        const alt = variantStr.split(":")[3] || "";
        const beta = vars.beta[i];
        const logP = vars.log_pvalue[i];
        const pval = Math.pow(10, -logP);
        const rsid = vars.rsid[i];

        results.push({
          tag: _variantKey,
          variant: {
            id: `${chr}_${pos}_${ref}_${alt}`,
            rsId: null, // Could be populated from dbSNP/ensembl
            chromosome: String(chr),
            position: pos,
            nearestCodingGene: null, // Optional: add lookup
            nearestCodingGeneDistance: null,
            __typename: "Variant",
          },
          pval,
          credibleSetSize: n,
          ldSetSize: null,
          oddsRatio: null,
          oddsRatioCILower: null,
          oddsRatioCIUpper: null,
          beta,
          betaCILower: null,
          betaCIUpper: null,
          direction: beta >= 0 ? "+" : "-",
          bestGenes: [], // Optional enrichment
          bestColocGenes: [], // Optional enrichment
          bestLocus2Genes: [], // Optional enrichment
          __typename: "ManhattanAssociation",
        });
      }
    });
  }

  return { data: results, cs_data };
}
