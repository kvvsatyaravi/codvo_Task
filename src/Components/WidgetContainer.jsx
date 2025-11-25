import React, { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMapEvents,
  useMap,
} from "react-leaflet";
import * as turf from "@turf/turf";
import { arcgisSpatialQuery } from "../reusableFunctions/arcgisQuery";
import * as L from "leaflet";
import * as EL from "esri-leaflet";

import BusinessLogic from "./BusinessLogic";
import Session from "./Session";
import QueryResults from "./QueryResults";

const FEATURE_SERVICE_URL =
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Enriched_USA_States_Generalized_Boundaries/FeatureServer/0";

function ClickBuffer({ onBufferCreated }) {
  useMapEvents({
    click(e) {
      const point = turf.point([e.latlng.lng, e.latlng.lat]);
      const buffer = turf.buffer(point, 5, { units: "miles" }); // 1 km buffer
      onBufferCreated(buffer);
    },
  });

  return null;
}

function FeatureServiceLayer() {
  const map = useMap();

  React.useEffect(() => {
    const layer = EL.featureLayer({
      url: FEATURE_SERVICE_URL,
      simplifyFactor: 0.5,
      precision: 4,
    }).addTo(map);

    return () => map.removeLayer(layer);
  }, [map]);

  return null;
}

export default function WidgetsContainer() {
  const [bufferGeom, setBufferGeom] = useState(null);
  const [results, setResults] = useState("Select any point on map");
  const [sessionObj, setSessionObj] = useState({
    queryParams: {},
    queryResults: {},
  });

  const handleBuffer = async (geojsonBuffer) => {
    setBufferGeom(null);

    const esriPolygon = {
      geometryType: "esriGeometryPolygon",
      rings: geojsonBuffer.geometry.coordinates[0].map(([lng, lat]) => [
        lng,
        lat,
      ]),
      spatialReference: { wkid: 4326 },
    };

    const response = await arcgisSpatialQuery({
      url: FEATURE_SERVICE_URL,
      geometry: esriPolygon,
      spatialRelation: "esriSpatialRelIntersects",
    });

    setSessionObj({
      queryParams: {
        url: FEATURE_SERVICE_URL,
        geometry: esriPolygon,
        spatialRelation: "esriSpatialRelIntersects",
        returnGeometry: true,
        outFields: ["*"],
        where: "1=1",
        f: "json",
      },
      queryResults: response.features.map((e) => e.attributes),
    });

    setResults(response.features.map((e) => e.attributes));
    setBufferGeom(geojsonBuffer);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <MapContainer
        center={[41, -100]}
        zoom={5}
        style={{ height: "100%", width: "70%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <FeatureServiceLayer />

        <ClickBuffer onBufferCreated={handleBuffer} />

        {bufferGeom && (
          <GeoJSON
            data={bufferGeom}
            style={{ color: "red", weight: 2, fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>

      <div style={{ width: "30%", padding: 10,overflow:'auto' }}>
        <QueryResults
          sessionObj={sessionObj}
          setSessionObj={setSessionObj}
          results={results}
          setResults={setResults}
          setBufferGeom={setBufferGeom}
          bufferGeom={bufferGeom}
        />

        <BusinessLogic />

        <Session sessionObj={sessionObj} />
      </div>
    </div>
  );
}
