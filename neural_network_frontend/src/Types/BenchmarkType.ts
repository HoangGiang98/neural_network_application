export enum BmMLMark {
  PROCESS_DATA = 'Process data',
  EXEC_SCENARIO = 'Execute scenario',
  COMPILE_MODEL = 'Compile model',
  TRAIN_MODEL = 'Train model',
  EVAL_MODEL = 'Evaluate model',
  MODEL_TEST = 'Send model and test data',
  MODEL_TRAIN = 'Send model and train data',
  SERIALIZE_MODEL = 'Seserialize trained model',
  SERIALIZE_STRUCTURE = 'Serialize model structure',
  MODEL_STRUCTURE = 'Send model structzre',
  END = 'END',
  START = 'START',
}

export type BmMLScenario =
  | 'scenario1'
  | 'scenario2'
  | 'scenario3'
  | 'scenario4';

export interface BmMLBenchmark {
  scenario1?: PerformanceEntryList[];
  scenario2?: PerformanceEntryList[];
  scenario3?: PerformanceEntryList[];
  scenario4?: PerformanceEntryList[];
}
