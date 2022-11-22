import ModelApi from "Api/Rest/ModelApi";
import {
  BmMLDataInfo,
  BmMLMark,
  BmMLParameters,
  BmMLParsedData,
  TensorLikeBmMLData,
  TensorLikeBmMLTargets
} from "Types/types";
import { CustomIOHandler } from "Utils/CustomIOHandler";

import * as tf from "@tensorflow/tfjs";

import { cloneMemoryInfo } from "./DataHandler";

const {
  START,
  END,
  COMPILE_MODEL,
  TRAIN_MODEL,
  EVAL_MODEL,
  MODEL_TEST,
  MODEL_TRAIN,
  MODEL_STRUCTURE,
  SERIALIZE_MODEL,
  SERIALIZE_STRUCTURE,
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
  return tf.tidy(() => {
    // Create a 2D `tf.Tensor` to hold the feature data.
    const xDims = data[0].length;
    const xs = tf.tensor2d(data, [numExamples, xDims]);
    // Create a 1D `tf.Tensor` to hold the labels, and convert the number label
    // from the set {0, 1, 2} into one-hot encoding (.e.g., 0 --> [1, 0, 0]).
    const ys = tf.oneHot(tf.tensor1d(targets).toInt(), numberOfClasses);
    return [xs, ys];
  });
}

function splitIntoTrainTestData(
  data: unknown[],
  targets: unknown[],
  testSplit: number,
  numberOfClasses: number
): BmMLDataInfo[] {
  return tf.tidy(() => {
    const numExamples = data.length;
    if (numExamples !== targets.length) {
      throw new Error('data and split have different numbers of examples');
    }
    // Randomly shuffle `data` and `targets`.
    const indices = [];
    for (let i = 0; i < numExamples; ++i) {
      indices.push(i);
    }
    tf.util.shuffle(indices);

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
  tf.engine().startScope('asyncTidy');
  try {
    const result = await fn();
    tf.engine().endScope();
    return result;
  } catch (ex) {
    tf.engine().endScope();
    throw ex;
  }
}

function memoryCleanUp(
  options: { removeVariables?: boolean },
  tensors?: tf.Tensor[]
): void {
  console.clear();
  console.group('Clean up tensors in Memory');
  console.groupCollapsed('Before');
  console.table(tf.memory());
  console.groupEnd();

  if (tensors !== undefined) {
    tf.dispose(tensors);
  }
  if (options.removeVariables) {
    tf.disposeVariables();
  }
  console.groupCollapsed('After');
  console.table(tf.memory());
  console.log(tf.engine());
  console.groupEnd();
  console.groupEnd();
}

function getSetData(
  testSplit: number,
  data: unknown[][],
  numberOfClasses: number
): BmMLDataInfo[] {
  return tf.tidy(() => {
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
      xTensors: tf.concat(xTrains, concatAxis),
      yTensors: tf.concat(yTrains, concatAxis),
      data: trainData.flat(),
      targets: trainTargets.flat(),
    };
    const testInfo = {
      xTensors: tf.concat(xTests, concatAxis),
      yTensors: tf.concat(yTests, concatAxis),
      data: testData.flat(),
      targets: testTargets.flat(),
    };
    return [trainInfo, testInfo];
  });
}

// function getSetDataDummy(
//   testSplit: number,
//   data: unknown[][],
//   numberOfClasses: number
// ) {
//   console.log(testSplit);
//   console.log(data);
//   console.log(numberOfClasses);
// }

function compileModel(
  xDims: number,
  params: BmMLParameters,
  numberOfClasses: number
) {
  const model = tf.sequential();
  params.layers.forEach((layer, id) => {
    if (id === 0) {
      model.add(
        tf.layers.dense({
          units: layer.numberOfNeurons,
          activation: layer.activation,
          inputShape: [xDims],
        })
      );
    } else {
      model.add(
        tf.layers.dense({
          units: layer.numberOfNeurons,
          activation: layer.activation,
        })
      );
    }
  });
  model.add(
    tf.layers.dense({
      units: numberOfClasses,
      activation: params.outputActivation,
    })
  );

  const optimizer = tf.train.adam();
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });
  return model;
}

async function trainModel(
  xTrain: tf.Tensor<tf.Rank>,
  yTrain: tf.Tensor<tf.Rank>,
  model: tf.Sequential | tf.LayersModel,
  params: BmMLParameters
): Promise<[tf.Sequential | tf.LayersModel, tf.Logs[]]> {
  const trainLogs: tf.Logs[] = [];
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
  xTest: tf.Tensor<tf.Rank>,
  yTest: tf.Tensor<tf.Rank>,
  trainedModel: tf.Sequential | tf.LayersModel,
  trainLogs: tf.Logs[]
): [string, number][] {
  return tf.tidy(() => {
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

function predictOnManualInput(
  model: tf.Sequential | tf.LayersModel,
  inputData: any,
  classes: string[]
) {
  // Use a `tf.tidy` scope to make sure that WebGL memory allocated for the `predict` call is released at the end.
  let logits, winner;
  tf.tidy(() => {
    // Prepare input data as a 2D `tf.Tensor`.
    const input = tf.tensor2d([inputData], [1, inputData.length]);
    // Call `model.predict` to get the prediction output as probabilities for categories.
    const predictOut = model.predict(input);
    if (Array.isArray(predictOut)) {
      throw new Error(
        'The output prediction is not suitable for classification task'
      );
    }
    logits = Array.from(predictOut.dataSync());
    winner = classes[predictOut.argMax(-1).dataSync()[0]];
  });
  return [logits, winner];
}

async function executeScenario1(
  trainInfo: BmMLDataInfo,
  testInfo: BmMLDataInfo,
  params: BmMLParameters,
  data: BmMLParsedData
): Promise<{
  trainedModel: tf.Sequential | tf.LayersModel;
  evaluationValues: [string, number][];
  trainLogs: tf.Logs[];
}> {
  performance.mark(COMPILE_MODEL + START);
  const compiledModel = compileModel(data.xDims, params, data.numberOfClasses);
  performance.mark(COMPILE_MODEL + END);
  const cMemory = cloneMemoryInfo(performance.memory);

  performance.mark(TRAIN_MODEL + START);
  const [trainedModel, trainLogs] = await trainModel(
    trainInfo.xTensors,
    trainInfo.yTensors,
    compiledModel,
    params
  );
  performance.mark(TRAIN_MODEL + END);
  const tMemory = cloneMemoryInfo(performance.memory);

  performance.mark(EVAL_MODEL + START);
  const evaluationValues = evaluateModel(
    testInfo.xTensors,
    testInfo.yTensors,
    trainedModel,
    trainLogs
  );
  performance.mark(EVAL_MODEL + END);
  const evMemory = cloneMemoryInfo(performance.memory);

  performance.measure(COMPILE_MODEL, {
    start: COMPILE_MODEL + START,
    end: COMPILE_MODEL + END,
    detail: { memoryUsage: cMemory },
  });
  performance.measure(TRAIN_MODEL, {
    start: TRAIN_MODEL + START,
    end: TRAIN_MODEL + END,
    detail: { memoryUsage: tMemory },
  });
  performance.measure(EVAL_MODEL, {
    start: EVAL_MODEL + START,
    end: EVAL_MODEL + END,
    detail: { memoryUsage: evMemory },
  });
  return { trainedModel, evaluationValues, trainLogs };
}

async function executeScenario2(
  trainInfo: BmMLDataInfo,
  testInfo: BmMLDataInfo,
  params: BmMLParameters,
  data: BmMLParsedData,
  id: string
): Promise<{
  trainedModel: tf.Sequential | tf.LayersModel;
  evaluationValues: [string, number][];
  trainLogs: tf.Logs[];
}> {
  performance.mark(COMPILE_MODEL + START);
  const compiledModel = compileModel(data.xDims, params, data.numberOfClasses);
  performance.mark(COMPILE_MODEL + END);
  const cMemory = cloneMemoryInfo(performance.memory);

  performance.mark(TRAIN_MODEL + START);
  const [trainedModel, trainLogs] = await trainModel(
    trainInfo.xTensors,
    trainInfo.yTensors,
    compiledModel,
    params
  );
  performance.mark(TRAIN_MODEL + END);
  const tMemory = cloneMemoryInfo(performance.memory);

  performance.mark(SERIALIZE_MODEL + START);
  const modelArtifacts = await CustomIOHandler.getModelArtifactFromTrainedModel(
    trainedModel
  );
  performance.mark(SERIALIZE_MODEL + END);
  const smMemory = cloneMemoryInfo(performance.memory);
  console.log(modelArtifacts);
  performance.mark(MODEL_TEST + START);
  const response = await ModelApi.sendModelArtifactsAndTestData(
    {
      dataInfo: { data: testInfo.data, targets: testInfo.targets },
      modelArtifacts: modelArtifacts,
      trainLogs: trainLogs,
    },
    id
  );
  performance.mark(MODEL_TEST + END);
  const mteMemory = cloneMemoryInfo(performance.memory);

  performance.measure(COMPILE_MODEL, {
    start: COMPILE_MODEL + START,
    end: COMPILE_MODEL + END,
    detail: { memoryUsage: cMemory },
  });
  performance.measure(TRAIN_MODEL, {
    start: TRAIN_MODEL + START,
    end: TRAIN_MODEL + END,
    detail: { memoryUsage: tMemory },
  });
  performance.measure(SERIALIZE_MODEL, {
    start: SERIALIZE_MODEL + START,
    end: SERIALIZE_MODEL + END,
    detail: { memoryUsage: smMemory },
  });
  performance.measure(MODEL_TEST, {
    start: MODEL_TEST + START,
    end: MODEL_TEST + END,
    detail: { memoryUsage: mteMemory },
  });
  if (!response.data) {
    throw new Error('Response does not have any data');
  }
  const { evaluationValues } = response.data;
  return { trainedModel, evaluationValues, trainLogs };
}

async function executeScenario3(
  selectedDataset: string,
  params: BmMLParameters,
  data: BmMLParsedData,
  id: string
): Promise<{
  trainedModel: tf.Sequential | tf.LayersModel;
  evaluationValues: [string, number][];
  trainLogs: tf.Logs[];
}> {
  performance.mark(COMPILE_MODEL + START);
  const compiledModel = compileModel(data.xDims, params, data.numberOfClasses);
  performance.mark(COMPILE_MODEL + END);
  const cMemory = cloneMemoryInfo(performance.memory);

  performance.mark(SERIALIZE_STRUCTURE + START);
  const modelStructure =
    await CustomIOHandler.getModelStructureFromCompiledModel(compiledModel);
  performance.mark(SERIALIZE_STRUCTURE + END);
  const ssMemory = cloneMemoryInfo(performance.memory);

  performance.mark(MODEL_STRUCTURE + START);
  const response = await ModelApi.sendModelStructure(
    {
      selectedDataset: selectedDataset,
      params: params,
      modelStructure: modelStructure,
    },
    id
  );
  performance.mark(MODEL_STRUCTURE + END);
  const msMemory = cloneMemoryInfo(performance.memory);

  if (!response.data) {
    throw new Error('Response does not have any data');
  }
  performance.measure(COMPILE_MODEL, {
    start: COMPILE_MODEL + START,
    end: COMPILE_MODEL + END,
    detail: { memoryUsage: cMemory },
  });
  performance.measure(SERIALIZE_STRUCTURE, {
    start: SERIALIZE_STRUCTURE + START,
    end: SERIALIZE_STRUCTURE + END,
    detail: { memoryUsage: ssMemory },
  });
  performance.measure(MODEL_STRUCTURE, {
    start: MODEL_STRUCTURE + START,
    end: MODEL_STRUCTURE + END,
    detail: { memoryUsage: msMemory },
  });
  const { trainedModel, evaluationValues, trainLogs } = response.data;
  return { trainedModel, evaluationValues, trainLogs };
}

async function executeScenario4(
  trainInfo: BmMLDataInfo,
  testInfo: BmMLDataInfo,
  params: BmMLParameters,
  data: BmMLParsedData,
  id: string
): Promise<{
  trainedModel: tf.Sequential | tf.LayersModel;
  evaluationValues: [string, number][];
  trainLogs: tf.Logs[];
}> {
  console.log(tf.getBackend());
  performance.mark(COMPILE_MODEL + START);
  const compiledModel = compileModel(data.xDims, params, data.numberOfClasses);
  performance.mark(COMPILE_MODEL + END);
  const cMemory = cloneMemoryInfo(performance.memory);

  performance.mark(SERIALIZE_STRUCTURE + START);
  const modelStructure =
    await CustomIOHandler.getModelStructureFromCompiledModel(compiledModel);
  performance.mark(SERIALIZE_STRUCTURE + END);
  const ssMemory = cloneMemoryInfo(performance.memory);

  performance.mark(MODEL_TRAIN + START);
  const response = await ModelApi.sendModelStructureAndTrainData(
    {
      dataInfo: { data: trainInfo.data, targets: trainInfo.targets },
      modelStructure: modelStructure,
      params: params,
    },
    id
  );
  performance.mark(MODEL_TRAIN + END);
  const mtrMemory = cloneMemoryInfo(performance.memory);

  if (!response.data) {
    throw new Error('Response does not have any data');
  }
  const { trainedModel, trainLogs } = response.data;
  performance.mark(EVAL_MODEL + START);
  const evaluationValues = evaluateModel(
    testInfo.xTensors,
    testInfo.yTensors,
    trainedModel,
    trainLogs
  );
  performance.mark(EVAL_MODEL + END);
  const evMemory = cloneMemoryInfo(performance.memory);

  performance.measure(COMPILE_MODEL, {
    start: COMPILE_MODEL + START,
    end: COMPILE_MODEL + END,
    detail: { memoryUsage: cMemory },
  });
  performance.measure(SERIALIZE_STRUCTURE, {
    start: SERIALIZE_STRUCTURE + START,
    end: SERIALIZE_STRUCTURE + END,
    detail: { memoryUsage: ssMemory },
  });
  performance.measure(MODEL_TRAIN, {
    start: MODEL_TRAIN + START,
    end: MODEL_TRAIN + END,
    detail: { memoryUsage: mtrMemory },
  });
  performance.measure(EVAL_MODEL, {
    start: EVAL_MODEL + START,
    end: EVAL_MODEL + END,
    detail: { memoryUsage: evMemory },
  });
  return {
    trainedModel: response.data.trainedModel,
    evaluationValues,
    trainLogs: response.data.trainLogs,
  };
}

const BmML = {
  asyncTidy,
  memoryCleanUp,
  getSetData,
  compileModel,
  trainModel,
  evaluateModel,
  predictOnManualInput,
  executeScenario1,
  executeScenario2,
  executeScenario3,
  executeScenario4,
  //getSetDataDummy,
};

export default BmML;
