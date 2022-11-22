import { Response } from "node-fetch";
import { BmMLModelStructure } from "Types/types";
import BmML from "Utils/BmML";

import { io } from "@tensorflow/tfjs-core";
import {
  LayersModel,
  loadLayersModel,
  Sequential
} from "@tensorflow/tfjs-node";

const ENCODING = 'base64';

const customSaveHandler = () => {
  // eslint-disable-next-line @typescript-eslint/require-await
  return io.withSaveHandler(async (modelArtifacts: io.ModelArtifacts) => {
    const saveResult: io.SaveResult = {
      modelArtifactsInfo: {
        ...io.getModelArtifactsInfoForJSON(modelArtifacts),
      },
      responses: [modelArtifacts] as Response[],
    };
    return saveResult;
  });
};

const customLoadHandler = (
  modelArtifacts: io.ModelArtifacts,
  weightData?: ArrayBuffer
) => {
  return io.fromMemory({
    modelTopology: modelArtifacts.modelTopology,
    weightSpecs: modelArtifacts.weightSpecs,
    weightData: weightData,
    trainingConfig: modelArtifacts.trainingConfig,
  });
};

const getModelArtifactFromTrainedModel = async (
  trainedModel: Sequential | LayersModel,
  inculdeTrainingOptimizer = true
): Promise<io.ModelArtifacts> => {
  const saveResult = await BmML.asyncTidy(async () => {
    return trainedModel.save(customSaveHandler(), {
      includeOptimizer: inculdeTrainingOptimizer,
    });
  });
  if (saveResult.responses === undefined) {
    throw new Error('Cannot retrieve trained model artifacts');
  }
  const modelArtifacts = saveResult.responses[0] as io.ModelArtifacts;
  if (!modelArtifacts.weightData) {
    throw new Error('Data weight is not available');
  }
  modelArtifacts.weightData = Buffer.from(modelArtifacts.weightData).toString(
    ENCODING
  ) as unknown as ArrayBuffer;
  return modelArtifacts;
};

const getTrainedModelFromModelArtifacts = async (
  modelArtifacts: io.ModelArtifacts,
  isLoadingStrict = true
): Promise<Sequential | LayersModel> => {
  if (!modelArtifacts.weightData) {
    throw new Error('Data weight is not available');
  }
  const weightData = new Uint8Array(
    Buffer.from(modelArtifacts.weightData as unknown as string, ENCODING)
  ).buffer;
  const trainedModel = await loadLayersModel(
    customLoadHandler(modelArtifacts, weightData),
    { strict: isLoadingStrict }
  );
  return trainedModel;
};

const getModelStructureFromCompiledModel = async (
  compiledModel: Sequential | LayersModel,
  inculdeTrainingOptimizer = true
): Promise<BmMLModelStructure> => {
  const saveResult = await BmML.asyncTidy(async () => {
    return compiledModel.save(customSaveHandler(), {
      includeOptimizer: inculdeTrainingOptimizer,
    });
  });
  if (!saveResult.responses) {
    throw new Error('Cannot retrieve compiled model artifacts');
  }
  const modelArtifacts = saveResult.responses[0] as io.ModelArtifacts;
  if (!modelArtifacts.modelTopology) {
    throw new Error('Cannot retrieve compiled model topology');
  }
  if (inculdeTrainingOptimizer && !modelArtifacts.trainingConfig) {
    throw new Error('Cannot retrieve compiled model training config');
  }
  return {
    modelTopology: modelArtifacts.modelTopology,
    trainingConfig: modelArtifacts.trainingConfig,
  };
};

const getCompiledModelFromModelStructure = async (
  modelStructure: BmMLModelStructure,
  isLoadingStrict = true
): Promise<Sequential | LayersModel> => {
  if (
    modelStructure.weightData !== undefined ||
    modelStructure.weightSpecs !== undefined
  ) {
    throw new Error('Model structure cannot have weightData or weightSpecs');
  }
  const compiledModel = await loadLayersModel(
    customLoadHandler(modelStructure),
    { strict: isLoadingStrict }
  );
  return compiledModel;
};

export const CustomIOHandler = {
  getModelArtifactFromTrainedModel,
  getTrainedModelFromModelArtifacts,
  getModelStructureFromCompiledModel,
  getCompiledModelFromModelStructure,
};
