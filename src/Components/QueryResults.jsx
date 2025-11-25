import React, { useEffect, useState } from "react";
import { Checkbox, Select } from "antd";
import { arcgisSpatialQuery } from "../reusableFunctions/arcgisQuery";

function QueryResults({ results, setResults, setBufferGeom, bufferGeom,sessionObj,setSessionObj }) {
  const FEATURE_SERVICE_URL =
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Enriched_USA_States_Generalized_Boundaries/FeatureServer/0";

  const [selectedOption, setSelectedOption] = useState(null);
  const [optionsArr, setOptionsArr] = useState([]);

  const getStateValues = async () => {
    const response = await arcgisSpatialQuery({
      url: FEATURE_SERVICE_URL,
      outFields: ["*"],
    });
    console.log(response);

    const optins = response.features.map((e) => ({
      label: e.attributes.STATE_NAME,
      value: e.attributes.STATE_NAME,
    }));

    setOptionsArr(optins);
  };

  useEffect(() => {
    getStateValues();
  }, []);

  useEffect(() => {
    if (bufferGeom) setSelectedOption(null);
  }, [bufferGeom]);

  return (
    <div style={{ height: "60vh", padding: 10 }}>
      <h1 className="text-lg font-bold">Query Results (JSON)</h1>
      <pre className="json-output mt-2">
        {results.length > 0
          ? JSON.stringify(results, null, 2)
          : "Please select on valid places"}
      </pre>

      <div style={{ padding: 4 }}>
        {/* <Checkbox
          checked={pointMode}
          onChange={(e) => setPointMode(e.target.checked)}
        >
          Select point on map
        </Checkbox> */}


        <label style={{ fontWeight: 600,fontSize:'14px' }}>
          Choose State: Autochange query results
        </label>
        <Select
          style={{ width: "100%", marginTop: 4 }}
          placeholder="Choose one"
          value={selectedOption}
          onChange={async (evt) => {
            const response = await arcgisSpatialQuery({
              url: FEATURE_SERVICE_URL,
              where: "STATE_NAME= '" + evt + "'",
            });

            const res = response.features.map((e) => e.attributes);
            setSessionObj({
              queryParams: {
                url: FEATURE_SERVICE_URL,
                spatialRelation: "esriSpatialRelIntersects",
                returnGeometry: true,
                outFields: ["*"],
                where: "STATE_NAME= '" + evt + "'",
                f: "json",
              },
              queryResults: res,
            });

            setResults(res);
            setSelectedOption(evt);
            setBufferGeom(null);
          }}
          options={optionsArr}
        />
      </div>
    </div>
  );
}

export default QueryResults;
