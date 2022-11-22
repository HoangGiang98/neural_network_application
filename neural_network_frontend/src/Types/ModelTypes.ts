import { BmMLBenchmark } from "Types/BenchmarkType";
import { BmMLParsedData, TensorLikeValue } from "Types/DataTypes";

import { LayersModel, Logs, Rank, Sequential, Tensor } from "@tensorflow/tfjs";
import { io } from "@tensorflow/tfjs-core";

export enum BmMLActivation {
  ELU = 'elu',
  HARD_SIGMOID = 'hardSigmoid',
  LINEAR = 'linear',
  RELU = 'relu',
  RELU_6 = 'relu6',
  SELU = 'selu',
  SIGMOID = 'sigmoid',
  SOFT_MAX = 'softmax',
  SOFT_PLUS = 'softplus',
  SOFT_SIGN = 'softsign',
  TANH = 'tanh',
  SWISH = 'swish',
  MISH = 'mish',
}

export enum BmMLParametersName {
  EPOCHS = 'epochs',
  TEST_SPLIT = 'testSplit',
  LAYERS = 'layers',
  ACTIVATION = 'activation',
  NEURONS_NUMBER = 'numberOfNeurons',
  HIDDEN_LAYERS_NUMBER = 'numberOfHiddenLayers',
  OUTPUT_ACTIVATION = 'outputActivation',
}

export interface BmMLModelStructure extends io.ModelArtifacts {
  modelTopology: Record<string, unknown> | ArrayBuffer;
  trainingConfig: io.TrainingConfig | undefined;
  weightData?: never;
  weightSpecs?: never;
}

export interface BmMLLayerConfig {
  activation: BmMLActivation;
  numberOfNeurons: number;
}

export interface BmMLParameters {
  epochs: number;
  testSplit: number;
  layers: BmMLLayerConfig[];
  outputActivation: BmMLActivation;
  numberOfHiddenLayers: number;
  learningRate?: number;
  batchSize?: number;
  optimizer?: string;
  loss?: string;
  metrics?: string;
  regularizers?: string;
}

export interface BmMLModelInfo<T = TensorLikeValue | TensorLikeValue[]> {
  dataInfo?: { data: T; targets: T };
  modelStructure?: BmMLModelStructure;
  selectedDataset?: string;
  params?: BmMLParameters;
  modelArtifacts?: io.ModelArtifacts;
  trainLogs?: Logs[];
}

export interface BmMLNeuralNetworksConfig {
  id: string;
  data: BmMLParsedData | undefined;
  params: BmMLParameters | undefined;
  evaluationValues: [string, number][] | undefined;
  trainedModel: Sequential | LayersModel | undefined;
  inferenceResult: string | undefined;
  logits: number | undefined;
  trainLogs?: Logs[];
  selectedDataset?: string;
  modelArtifacts?: io.ModelArtifacts;
  dataTensors?: Tensor<Rank>[];
  benchmark?: BmMLBenchmark;
}
