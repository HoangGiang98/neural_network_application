import { performance } from "perf_hooks";
import { db } from "server";
import {
  BmMLDataInfo,
  BmMLMark,
  BmMLModelStructure,
  BmMLParameters,
  BmMLParsedData
} from "Types/types";
import BmML from "Utils/BmML";

import { io } from "@tensorflow/tfjs-core";
import * as tfn from "@tensorflow/tfjs-node";

const { PROCESS_DATA, START, END } = BmMLMark;

const handleScenario2 = async (
  testInfo: BmMLDataInfo,
  modelArtifacts: io.ModelArtifacts,
  trainLogs: tfn.Logs[],
  nnId: string
): Promise<{
  evaluationValues: [string, number][];
  dataTensors: tfn.Tensor<tfn.Rank>[];
}> => {
  performance.mark(PROCESS_DATA + START);
  const xTest = tfn.tensor(testInfo.data);
  const yTest = tfn.tensor(testInfo.targets);
  performance.mark(PROCESS_DATA + END);
  const dMemory = process.memoryUsage();

  const { evaluationValues } = await BmML.executeOnServerScenario2(
    { xTest, yTest },
    modelArtifacts,
    trainLogs,
    nnId
  );
  const dataTensors = [xTest, yTest];
  performance.measure(PROCESS_DATA, {
    start: PROCESS_DATA + START,
    end: PROCESS_DATA + END,
    detail: { scenario: 'scenario2', nnId, memoryUsage: dMemory },
  });
  return { evaluationValues, dataTensors };
};

const handleScenario3 = async (
  selectedDataset: string,
  params: BmMLParameters,
  modelStructure: BmMLModelStructure,
  nnId: string
): Promise<{
  modelArtifacts: io.ModelArtifacts;
  evaluationValues: [string, number][];
  trainLogs: tfn.Logs[];
  dataTensors: tfn.Tensor<tfn.Rank>[];
}> => {
  const serverData = db
    .get(`${nnId}`)
    .get(`${selectedDataset}`)
    .value() as BmMLParsedData;

  if (serverData?.body === undefined) {
    throw new Error('Data could not be retrieved from server');
  }
  performance.mark(PROCESS_DATA + START);
  const [trainInfo, testInfo] = BmML.getSetData(
    params.testSplit,
    serverData.body,
    serverData.numberOfClasses
  );
  performance.mark(PROCESS_DATA + END);
  const dMemory = process.memoryUsage();

  const { modelArtifacts, evaluationValues, trainLogs } =
    await BmML.executeOnServerScenario3(
      trainInfo,
      testInfo,
      params,
      modelStructure,
      nnId
    );
  const dataTensors = [
    trainInfo.xTensors,
    trainInfo.yTensors,
    testInfo.xTensors,
    testInfo.yTensors,
  ];
  performance.measure(PROCESS_DATA, {
    start: PROCESS_DATA + START,
    end: PROCESS_DATA + END,
    detail: { scenario: 'scenario3', nnId, memoryUsage: dMemory },
  });
  return { modelArtifacts, evaluationValues, trainLogs, dataTensors };
};

const handleScenario4 = async (
  trainInfo: BmMLDataInfo,
  modelStructure: BmMLModelStructure,
  params: BmMLParameters,
  nnId: string
): Promise<{
  modelArtifacts: io.ModelArtifacts;
  trainLogs: tfn.Logs[];
  dataTensors: tfn.Tensor<tfn.Rank>[];
}> => {
  performance.mark(PROCESS_DATA + START);
  const xTrain = tfn.tensor(trainInfo.data);
  const yTrain = tfn.tensor(trainInfo.targets);
  performance.mark(PROCESS_DATA + END);
  const dMemory = process.memoryUsage();
  const { modelArtifacts, trainLogs } = await BmML.executeOnServerScenario4(
    { xTrain, yTrain },
    params,
    modelStructure,
    nnId
  );
  const dataTensors = [xTrain, yTrain];
  performance.measure(PROCESS_DATA, {
    start: PROCESS_DATA + START,
    end: PROCESS_DATA + END,
    detail: { scenario: 'scenario4', nnId, memoryUsage: dMemory },
  });
  return { modelArtifacts, trainLogs, dataTensors };
};

export default {
  handleScenario2,
  handleScenario3,
  handleScenario4,
};
