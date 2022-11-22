import { PerformanceEntry } from "perf_hooks";

export enum BmMLMark {
  PROCESS_DATA = 'Process data on server',
  EXEC_SCENARIO = 'Execute scenario on server',
  TRAIN_MODEL = 'Train model on server',
  DESERIALIZE_MODEL = 'Deserialize trained model on server',
  SERIALIZE_MODEL = 'Seserialize trained model on server',
  DESERIALIZE_STRUCTURE = 'Deserialize model structure on server',
  EVAL_MODEL = 'Evaluate model on server',
  END = 'END',
  START = 'START',
}

export type BmMLScenario =
  | 'scenario1'
  | 'scenario2'
  | 'scenario3'
  | 'scenario4';

export interface BmMLBenchmark {
  scenario1?: PerformanceEntry[][];
  scenario2?: PerformanceEntry[][];
  scenario3?: PerformanceEntry[][];
  scenario4?: PerformanceEntry[][];
}
