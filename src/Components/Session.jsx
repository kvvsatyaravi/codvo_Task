import React, { useState,useRef } from "react";
import { Button, Modal, Typography } from "antd";

const { Text } = Typography;

function Session({sessionObj}) {
  const FEATURE_SERVICE_URL =
    "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/Enriched_USA_States_Generalized_Boundaries/FeatureServer/0";

  const [loadedData, setLoadedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
   const fileRef = useRef(null);
  const [file, setFile] = useState(null);

  const queryParams = sessionObj.queryParams;

  const queryResults = sessionObj.queryResults;


  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    fileRef.current.value = ""; // Clear the file input
  };

  const saveToJson = () => {
    const combined = {
      SessionTime:
        new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
    queryResult: queryResults,
      queryParams: queryParams,
      
    };

    const jsonStr = JSON.stringify(
      Object.keys(combined.queryResult).length ? combined : null,
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const d = new Date();
    const ts = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    link.download = `combinedData_${ts}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadJson = (event) => {
    setFile(event.target.files[0]);
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setLoadedData(parsed);
        setIsModalOpen(true);
      } catch (err) {
        console.error("Invalid JSON file", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4" style={{ height: "23vh" }}>
      <h1 className="text-lg font-bold">Session Save File & Load Session</h1>

      <Button onClick={saveToJson} className=" bg-blue-500 text-white shadow">
        Save JSON
      </Button>

      <div>
        <input type="file" accept="application/json" onChange={loadJson}  ref={fileRef} />
        {file && (
        <div style={{ marginTop: "10px",marginBottom:"15px" }}>
          <span>{file.name}</span>
          <Button style={{marginLeft:'8px'}} onClick={removeFile} danger>
            Remove
          </Button>
        </div>
      )}
      </div>

      <Modal
        title="Saved Session Preview"
        open={isModalOpen}
        width={900}
        height={1400}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {loadedData ? (
          <>
            <Text strong>Full Session Payload:</Text>

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
  );
}

export default Session;
