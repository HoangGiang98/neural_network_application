import { performance } from 'perf_hooks';
import {
  BmMLDataInfo,
  BmMLMark,
  BmMLModelStructure,
  BmMLParameters,
  TensorLikeBmMLData,
  TensorLikeBmMLTargets,
} from 'Types/types';
import { CustomIOHandler } from 'Utils/CustomIOHandler';

import { io } from '@tensorflow/tfjs-core';
import * as tfn from '@tensorflow/tfjs-node';

const {
  EVAL_MODEL,
  DESERIALIZE_MODEL,
  DESERIALIZE_STRUCTURE,
  SERIALIZE_MODEL,
  TRAIN_MODEL,
  START,
  END,
} = BmMLMark;
function getNumberTrainTestExample(
  totalExamples: number,
  testSplit: number
): { numTrainExamples: number; numTestExamples: number } {
  let numTestExamples = Math.round(totalExamples * testSplit);
  if (numTestExamples === 0) {
    numTestExamples = 1;
  }
  let numTrainExamples = totalExamples - numTestExamples;
  if (numTrainExamples === 0) {
    numTrainExamples = 1;
    numTestExamples = totalExamples - numTrainExamples;
  }
  return { numTrainExamples, numTestExamples };
}

function convertToTensors(
  data: TensorLikeBmMLData,
  targets: TensorLikeBmMLTargets,
  numExamples: number,
  numberOfClasses: number
) {
  return tfn.tidy(() => {
    // Create a 2D `tf.Tensor` to hold the feature data.
    const xDims = data[0].length;
    const xs = tfn.tensor2d(data, [numExamples, xDims]);
    // Create a 1D `tf.Tensor` to hold the labels, and convert the number label
    // from the set {0, 1, 2} into one-hot encoding (.e.g., 0 --> [1, 0, 0]).
    const ys = tfn.oneHot(tfn.tensor1d(targets).toInt(), numberOfClasses);
    return [xs, ys];
  });
}

function splitIntoTrainTestData(
  data: unknown[],
  targets: unknown[],
  testSplit: number,
  numberOfClasses: number
): BmMLDataInfo[] {
  return tfn.tidy(() => {
    const numExamples = data.length;
    if (numExamples !== targets.length) {
      throw new Error('data and split have different numbers of examples');
    }
    // Randomly shuffle `data` and `targets`.
    const indices = [];
    for (let i = 0; i < numExamples; ++i) {
      indices.push(i);
    }
    tfn.util.shuffle(indices);

    const shuffledData = [];
    const shuffledTargets = [];
    for (let i = 0; i < numExamples; ++i) {
      shuffledData.push(data[indices[i]]);
      shuffledTargets.push(targets[indices[i]]);
    }

    // Split the data into a training set and a tet set, based on `testSplit`.
    const { numTrainExamples, numTestExamples } = getNumberTrainTestExample(
      numExamples,
      testSplit
    );
    const trainData = shuffledData.slice(
      0,
      numTrainExamples
    ) as TensorLikeBmMLData;

    const trainTargets = shuffledTargets.slice(
      0,
      numTrainExamples
    ) as TensorLikeBmMLTargets;
    const testData = shuffledData.slice(numTrainExamples) as TensorLikeBmMLData;
    const testTargets = shuffledTargets.slice(
      numTrainExamples
    ) as TensorLikeBmMLTargets;

    const [xTrain, yTrain] = convertToTensors(
      trainData,
      trainTargets,
      numTrainExamples,
      numberOfClasses
    );
    const [xTest, yTest] = convertToTensors(
      testData,
      testTargets,
      numTestExamples,
      numberOfClasses
    );

    const trainInfo = {
      xTensors: xTrain,
      yTensors: yTrain,
      data: xTrain.arraySync(),
      targets: yTrain.arraySync(),
    };
    const testInfo = {
      xTensors: xTest,
      yTensors: yTest,
      data: xTest.arraySync(),
      targets: yTest.arraySync(),
    };
    return [trainInfo, testInfo];
  });
}

// Custom asyncTidy function to cleanup tensors created in async Function
async function asyncTidy<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof fn !== 'function') {
    throw new Error('Please provide a function to tidy()');
  }
  tfn.engine().startScope('asyncTidy');
  try {
    const result = await fn();
    tfn.engine().endScope();
    return result;
  } catch (ex) {
    tfn.engine().endScope();
    throw ex;
  }
}

function memoryCleanUp(
  options: { removeVariables?: boolean },
  tensors?: tfn.Tensor[]
): void {
  console.group('Clean up tensors in Memory');
  console.groupCollapsed('Before');
  console.table(tfn.memory());
  console.groupEnd();

  if (tensors !== undefined) {
    tfn.dispose(tensors);
  }
  if (options.removeVariables) {
    tfn.disposeVariables();
  }
  console.groupCollapsed('After');
  console.table(tfn.memory());
  console.groupEnd();
  console.groupEnd();
}

export function getSetData(
  testSplit: number,
  data: unknown[][],
  numberOfClasses: number
): BmMLDataInfo[] {
  return tfn.tidy(() => {
    const dataByClass: unknown[][] = [];
    const targetsByClass: unknown[][] = [];
    for (let i = 0; i < numberOfClasses; ++i) {
      dataByClass.push([]);
      targetsByClass.push([]);
    }
    for (const example of data) {
      const target = example[example.length - 1] as number;
      const data = example.slice(0, example.length - 1);
      dataByClass[target].push(data);
      targetsByClass[target].push(target);
    }
    const xTrains = [];
    const yTrains = [];
    const xTests = [];
    const yTests = [];
    const trainData = [];
    const trainTargets = [];
    const testData = [];
    const testTargets = [];
    for (let i = 0; i < numberOfClasses; ++i) {
      const [trainInfo, testInfo] = splitIntoTrainTestData(
        dataByClass[i],
        targetsByClass[i],
        testSplit,
        numberOfClasses
      );
      xTrains.push(trainInfo.xTensors);
      yTrains.push(trainInfo.yTensors);
      trainData.push(trainInfo.data);
      trainTargets.push(trainInfo.targets);
      xTests.push(testInfo.xTensors);
      yTests.push(testInfo.yTensors);
      testData.push(testInfo.data);
      testTargets.push(testInfo.targets);
    }
    const concatAxis = 0;
    const trainInfo = {
      xTensors: tfn.concat(xTrains, concatAxis),
      yTensors: tfn.concat(yTrains, concatAxis),
      data: trainData.flat(),
      targets: trainTargets.flat(),
    };
    const testInfo = {
      xTensors: tfn.concat(xTests, concatAxis),
      yTensors: tfn.concat(yTests, concatAxis),
      data: testData.flat(),
      targets: testTargets.flat(),
    };
    return [trainInfo, testInfo];
  });
}

async function trainModel(
  xTrain: tfn.Tensor<tfn.Rank>,
  yTrain: tfn.Tensor<tfn.Rank>,
  model: tfn.Sequential | tfn.LayersModel,
  params: BmMLParameters
): Promise<[tfn.Sequential | tfn.LayersModel, tfn.Logs[]]> {
  const trainLogs: tfn.Logs[] = [];
  const beginMs = performance.now();
  // Call `model.fit` to train the model.
  await model.fit(xTrain, yTrain, {
    epochs: params.epochs,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        // Plot the loss and accuracy values at the end of every training epoch.
        const secPerEpoch =
          (performance.now() - beginMs) / (1000 * (epoch + 1));
        const e = epoch + 1;
        console.log(
          `Training model... Epoch ${e} of ${
            params.epochs
          } completed. Approximately ${secPerEpoch.toFixed(
            4
          )} seconds per epoch`
        );
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        trainLogs.push(logs!);
      },
    },
  });
  const secPerEpoch = (performance.now() - beginMs) / (1000 * params.epochs);
  console.log(
    `Model training complete:  ${secPerEpoch.toFixed(4)} seconds per epoch`
  );
  return [model, trainLogs];
}

function evaluateModel(
  xTest: tfn.Tensor<tfn.Rank>,
  yTest: tfn.Tensor<tfn.Rank>,
  trainedModel: tfn.LayersModel | tfn.Sequential,
  trainLogs: tfn.Logs[]
): [string, number][] {
  return tfn.tidy(() => {
    const results = trainedModel.evaluate(xTest, yTest);

    if (!Array.isArray(results)) {
      throw new Error(
        'The output classes are not suitable for classification task'
      );
    }
    const [testLoss, testAcc] = results.map((result) => result.dataSync()[0]);
    const { loss, acc } = trainLogs[trainLogs.length - 1];
    return [
      ['Final train loss', loss],
      ['Test loss', testLoss],
      ['Final train accuracy', acc],
      ['Test accuracy', testAcc],
    ];
  });
}

async function executeOnServerScenario2(
  testInfo: { xTest: tfn.Tensor<tfn.Rank>; yTest: tfn.Tensor<tfn.Rank> },
  modelArtifacts: io.ModelArtifacts,
  trainLogs: tfn.Logs[],
  nnId: string
): Promise<{ evaluationValues: [string, number][] }> {
  performance.mark(DESERIALIZE_MODEL + START);
  const trainedModel = await CustomIOHandler.getTrainedModelFromModelArtifacts(
    modelArtifacts
  );
  performance.mark(DESERIALIZE_MODEL + END);
  const dmMemory = process.memoryUsage();
  trainedModel.summary();

  performance.mark(EVAL_MODEL + START);
  const evaluationValues = evaluateModel(
    testInfo.xTest,
    testInfo.yTest,
    trainedModel,
    trainLogs
  );
  performance.mark(EVAL_MODEL + END);
  const evMemory = process.memoryUsage();

  performance.measure(DESERIALIZE_MODEL, {
    start: DESERIALIZE_MODEL + START,
    end: DESERIALIZE_MODEL + END,
    detail: { scenario: 'scenario2', nnId, memoryUsage: dmMemory },
  });
  performance.measure(EVAL_MODEL, {
    start: EVAL_MODEL + START,
    end: EVAL_MODEL + END,
    detail: { scenario: 'scenario2', nnId, memoryUsage: evMemory },
  });
  return { evaluationValues };
}

async function executeOnServerScenario3(
  trainInfo: BmMLDataInfo,
  testInfo: BmMLDataInfo,
  params: BmMLParameters,
  modelStructure: BmMLModelStructure,
  nnId: string
): Promise<{
  modelArtifacts: io.ModelArtifacts;
  evaluationValues: [string, number][];
  trainLogs: tfn.Logs[];
}> {
  performance.mark(DESERIALIZE_STRUCTURE + START);
  const compiledModel =
    await CustomIOHandler.getCompiledModelFromModelStructure(modelStructure);
  performance.mark(DESERIALIZE_STRUCTURE + END);
  const dsMemory = process.memoryUsage();

  performance.mark(TRAIN_MODEL + START);
  const [trainedModel, trainLogs] = await trainModel(
    trainInfo.xTensors,
    trainInfo.yTensors,
    compiledModel,
    params
  );
  performance.mark(TRAIN_MODEL + END);
  const tMemory = process.memoryUsage();
  trainedModel.summary();

  performance.mark(EVAL_MODEL + START);
  const evaluationValues = evaluateModel(
    testInfo.xTensors,
    testInfo.yTensors,
    trainedModel,
    trainLogs
  );
  performance.mark(EVAL_MODEL + END);
  const evMemory = process.memoryUsage();

  performance.mark(SERIALIZE_MODEL + START);
  const modelArtifacts = await CustomIOHandler.getModelArtifactFromTrainedModel(
    trainedModel
  );
  performance.mark(SERIALIZE_MODEL + END);
  const smMemory = process.memoryUsage();

  performance.measure(DESERIALIZE_STRUCTURE, {
    start: DESERIALIZE_STRUCTURE + START,
    end: DESERIALIZE_STRUCTURE + END,
    detail: { scenario: 'scenario3', nnId, memoryUsage: dsMemory },
  });
  performance.measure(TRAIN_MODEL, {
    start: TRAIN_MODEL + START,
    end: TRAIN_MODEL + END,
    detail: { scenario: 'scenario3', nnId, memoryUsage: tMemory },
  });
  performance.measure(EVAL_MODEL, {
    start: EVAL_MODEL + START,
    end: EVAL_MODEL + END,
    detail: { scenario: 'scenario3', nnId, memoryUsage: evMemory },
  });
  performance.measure(SERIALIZE_MODEL, {
    start: SERIALIZE_MODEL + START,
    end: SERIALIZE_MODEL + END,
    detail: { scenario: 'scenario3', nnId, memoryUsage: smMemory },
  });
  return { modelArtifacts, evaluationValues, trainLogs };
}

async function executeOnServerScenario4(
  trainInfo: { xTrain: tfn.Tensor<tfn.Rank>; yTrain: tfn.Tensor<tfn.Rank> },
  params: BmMLParameters,
  modelStructure: BmMLModelStructure,
  nnId: string
): Promise<{ modelArtifacts: io.ModelArtifacts; trainLogs: tfn.Logs[] }> {
  performance.mark(DESERIALIZE_STRUCTURE + START);
  const compiledModel =
    await CustomIOHandler.getCompiledModelFromModelStructure(modelStructure);
  performance.mark(DESERIALIZE_STRUCTURE + END);
  const dmMemory = process.memoryUsage();

  // console.log('HIIIIIIIIII');
  // console.log(tfn.getBackend());
  performance.mark(TRAIN_MODEL + START);
  const [trainedModel, trainLogs] = await trainModel(
    trainInfo.xTrain,
    trainInfo.yTrain,
    compiledModel,
    params
  );
  performance.mark(TRAIN_MODEL + END);
  const tMemory = process.memoryUsage();
  trainedModel.summary();

  performance.mark(SERIALIZE_MODEL + START);
  const modelArtifacts = await CustomIOHandler.getModelArtifactFromTrainedModel(
    trainedModel
  );
  performance.mark(SERIALIZE_MODEL + END);
  const smMemory = process.memoryUsage();

  performance.measure(DESERIALIZE_STRUCTURE, {
    start: DESERIALIZE_STRUCTURE + START,
    end: DESERIALIZE_STRUCTURE + END,
    detail: { scenario: 'scenario4', nnId, memoryUsage: dmMemory },
  });
  performance.measure(TRAIN_MODEL, {
    start: TRAIN_MODEL + START,
    end: TRAIN_MODEL + END,
    detail: { scenario: 'scenario4', nnId, memoryUsage: tMemory },
  });
  performance.measure(SERIALIZE_MODEL, {
    start: SERIALIZE_MODEL + START,
    end: SERIALIZE_MODEL + END,
    detail: { scenario: 'scenario4', nnId, memoryUsage: smMemory },
  });
  return { modelArtifacts, trainLogs };
}

const BmML = {
  asyncTidy,
  memoryCleanUp,
  getSetData,
  trainModel,
  evaluateModel,
  executeOnServerScenario2,
  executeOnServerScenario3,
  executeOnServerScenario4,
};

export default BmML;
