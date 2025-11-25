// arcgisQuery.js
import * as query from "@arcgis/core/rest/query.js";
import Polygon from "@arcgis/core/geometry/Polygon.js";

export async function arcgisSpatialQuery({
  url,
  geometry = null,
  distance = null,
  spatialRelation = "esriSpatialRelIntersects",
  returnGeometry = true,
  outFields = ["*"],
  where = "1=1",
  orderByFields = null,
}) {
  try {
    const params = {
      f: "json",

      spatialRel: spatialRelation,
      returnGeometry,
      outFields: outFields.join(","),
      where: where,
    };

    if (geometry) {
      params.geometryType = geometry.geometryType || "esriGeometryPolygon";
      params.geometry = new Polygon({
        rings: geometry.rings,
        spatialReference: geometry.spatialReference,
      });
    }

    if (orderByFields) {
      params.orderByFields = orderByFields;
    }

    if (distance) {
      params.distance = distance;
      params.units = "esriSRUnit_Meter";
    }

    const response = await query.executeQueryJSON(url, params);
    return response;
  } catch (err) {
    console.log(err);
  }
}
