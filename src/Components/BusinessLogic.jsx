import React, { useState } from "react";
import { Button, Modal, Typography } from "antd";
import { arcgisSpatialQuery } from "../reusableFunctions/arcgisQuery";

const { Text } = Typography;

function BusinessLogic() {
  const FEATURE_SERVICE_URL =
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Enriched_USA_States_Generalized_Boundaries/FeatureServer/0";

  const [results, setResults] = useState(null);
  const [loadedData, setLoadedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryReport = async () => {
    const response = await arcgisSpatialQuery({
      url: FEATURE_SERVICE_URL,
      orderByFields: "SQMI",
      outFields: ["*"],
    });

    const totalRecords = response.features.length;
    const nonCompliantRecords = response.features.filter(
      (e) => e.attributes.SQMI < 2500
    );

    const reportJson = {
      totalCountries: totalRecords,
      non_compliant_count: nonCompliantRecords.length,
      non_compliant_countries: nonCompliantRecords.map((e) => {
        return {
          stateName: e.attributes.STATE_NAME,
          countrySource: e.attributes.sourceCountry,
          require_Sqmi: 2500,
          shortfall_Sqmi: 2500 - e.attributes.SQMI,
          recommendation: "Consider consoldation with adjacent countries",
        };
      }),
    };

    setLoadedData(reportJson);
    setIsModalOpen(true)
  };

  return (
    <div style={{ height: "15vh" }}>
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-bold">Business Report</h1>

        <Button
          className=" bg-blue-500 text-white shadow"
          onClick={queryReport}
        >
          Show Generated Report
        </Button>
        <Modal
          title="Query results based on below 2,500 square miles"
          open={isModalOpen}
          width={900}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>,
          ]}
        >
          {loadedData ? (
            <>
              <Text strong>Compliance Report:</Text>

              <pre
                style={{
                  background: "#f8f8f8",
                  padding: "15px",
                  borderRadius: "6px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                  border: "1px solid #e5e5e5",
                }}
              >
                {JSON.stringify(loadedData, null, 2)}
              </pre>
            </>
          ) : (
            "No session Data."
          )}
        </Modal>
      </div>
    </div>
  );
}

export default BusinessLogic;
