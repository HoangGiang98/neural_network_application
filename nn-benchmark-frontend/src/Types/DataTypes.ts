import { Rank, Tensor } from '@tensorflow/tfjs';

export interface BmMLParsedData {
  header: string[];
  body?: unknown[][];
  classes: string[];
  xDims: number;
  numberOfClasses: number;
}
export type TensorLikeValue =
  | number
  | number[]
  | number[][]
  | number[][][]
  | number[][][][]
  | number[][][][][]
  | number[][][][][][];

export type TensorLikeBmMLData =
  | number[][]
  | boolean[][]
  | string[][]
  | Uint8Array[][];

export type TensorLikeBmMLTargets =
  | number[]
  | boolean[]
  | string[]
  | Uint8Array[];

export interface BmMLDataInfo<T = TensorLikeValue | TensorLikeValue[]> {
  xTensors: Tensor<Rank>;
  yTensors: Tensor<Rank>;
  data: T;
  targets: T;
}
