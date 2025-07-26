import { ClientOnly } from "remix-utils/client-only";
import { json } from "@remix-run/node";
import { convertCredibleSetsToManhattan } from "~/logic/data-transformer";
import hg_data from "~/data/hg-data_2.json";

export async function loader() {
  const { data, cs_data } = convertCredibleSetsToManhattan(hg_data);

  const graph_data = {
    manhattan: {
      associations: data,
      credibleSets: cs_data,
      __typename: "Manhattan",
    },
  };
  return json(graph_data);
}

import { useLoaderData } from "@remix-run/react";
import ManhattanContainer from "~/components/ManhattanContainer";

export default function Index() {
  const graph_data = useLoaderData();
  const studyId = "GCST002222";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
        Variant Credibleset Graph
      </h1>
      <ClientOnly
        fallback={
          <p className="text-lg text-gray-600">Loading Visualization...</p>
        }
      >
        {() => (
          <ManhattanContainer
            studyId={studyId}
            hasSumstats={true}
            loading={false}
            error={false}
            data={graph_data}
          />
        )}
      </ClientOnly>
    </div>
  );
}
