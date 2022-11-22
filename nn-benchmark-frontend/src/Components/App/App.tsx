import "./App.scss";

import DataApi from "Api/Rest/DataApi";
import ModelApi from "Api/Rest/ModelApi";
import NeuralNetworksManagement from "Components/NeuralNetworksManagement/NeuralNetworksManagement";
import React, { useEffect } from "react";

// Temporary for benchmarking
declare global {
  interface Window {
    downloadBenchmark: (nnId: string) => void;
    resetBenchmarkData: (nnId: string) => void;
  }
  interface Performance {
    memory: Record<string, unknown>;
  }
}
window.downloadBenchmark = async (nnId: string) => {
  await ModelApi.saveBenchmarkedModelConfig(nnId);
  void DataApi.getBenchmarkData(nnId);
};
window.resetBenchmarkData = async (nnId: string) => {
  await DataApi.resetBenchmarkData(nnId);
};

const App = (): React.ReactElement => {
  useEffect(() => {
    void DataApi.getDataListFromServer();
  }, []);
  return (
    <main className='App-main'>
      <NeuralNetworksManagement />
    </main>
  );
};

export default App;
