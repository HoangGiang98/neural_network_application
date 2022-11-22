import { BmMLScenario } from "Types/types";

export default class Endpoint {
  static DATASET_INFO = (id: string, selectedDataset: string) =>
    `/data-info?id=${id}&dataset=${selectedDataset}`;
  static DATA_LIST = '/datalist';
  static SCENARIO_2 = (id: string) => `/scenario2?id=${id}`;
  static SCENARIO_3 = (id: string) => `/scenario3?id=${id}`;
  static SCENARIO_4 = (id: string) => `/scenario4?id=${id}`;
  static BENCHMARK_CONFIG_SAVE = (id: string) =>
    `/benchmark/config/save?id=${id}`;
  static BENCHMARK_SAVE = (id: string, scenario: BmMLScenario) =>
    `/benchmark/save?id=${id}&scenario=${scenario}`;
  static BENCHMARK_GET = (id: string) => `/benchmark/get?id=${id}`;
  static BENCHMARK_RESET = (id: string) => `/benchmark/reset?id=${id}`;
}
