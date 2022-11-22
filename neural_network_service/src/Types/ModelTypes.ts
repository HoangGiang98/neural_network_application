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
