import { api } from "Api/api";
import Endpoint from "Api/Endpoint";
import * as FileSaver from "file-saver";
import {
  saveDataIntoConfig,
  saveServerDataList
} from "Store/NeuralNetworksConfig/NeuralNetworksConfigActions";
import { store } from "Store/store";
import { BmMLApiResponse, BmMLParsedData, BmMLScenario } from "Types/types";

export default class DataApi {
  static async getDataListFromServer() {
    const response = await api.getFromServer<string[]>(Endpoint.DATA_LIST);
    if (response.ok) {
      store.dispatch(saveServerDataList(response.data));
    } else {
      console.error(`${response.message}`);
    }
  }
  static async getDatasetInfo(
    id: string,
    selectedDataset: string
  ): Promise<BmMLApiResponse<BmMLParsedData>> {
    const response = await api.getFromServer(
      Endpoint.DATASET_INFO(id, selectedDataset)
    );
    if (response.ok) {
      console.log('Data successfully loaded from server');
    } else {
      console.error(`${response.message}`);
    }
    return response;
  }
  static async saveBenchmarkData(
    nnId: string,
    scenario: BmMLScenario,
    benchmarkData: {
      name: string;
      entryType: string;
      startTime: number;
      duration: number;
      detail: any;
    }[]
  ) {
    const response = await api.postToServer(
      Endpoint.BENCHMARK_SAVE(nnId, scenario),
      benchmarkData
    );
    if (response.ok) {
      console.log(response.data);
    } else {
      console.error(`${response.message}`);
    }
  }
  static async getBenchmarkData(nnId: string) {
    const response = await api.getFromServer(Endpoint.BENCHMARK_GET(nnId));
    if (response.ok) {
      const fileBlob = new Blob([JSON.stringify(response.data)], {
        type: 'application/json',
      });
      FileSaver.saveAs(fileBlob, `report-${nnId}.json`);
    } else {
      console.error(`${response.message}`);
    }
  }
  static async resetBenchmarkData(nnId: string) {
    const response = await api.getFromServer(Endpoint.BENCHMARK_RESET(nnId));
    if (response.ok) {
      console.log(response.data);
      store.dispatch(saveDataIntoConfig({ benchmark: undefined }, nnId));
    } else {
      console.error(`${response.message}`);
    }
  }
}
