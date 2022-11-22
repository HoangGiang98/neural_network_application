import { api } from "Api/api";
import Endpoint from "Api/Endpoint";
import {
  NN_1,
  NN_2,
  NN_3,
  NN_4
} from "Components/NeuralNetworksManagement/NeuralNetworksList/NeuralNetworksList";
import { store } from "Store/store";
import { BmMLApiResponse, BmMLModelInfo } from "Types/types";
import { CustomIOHandler } from "Utils/CustomIOHandler";

import * as tf from "@tensorflow/tfjs";

export default class ModelApi {
  static async sendModelStructure(
    data: BmMLModelInfo,
    id: string
  ): Promise<
    BmMLApiResponse<{
      trainedModel: tf.Sequential | tf.LayersModel;
      evaluationValues: [string, number][];
      trainLogs: tf.Logs[];
    }>
  > {
    const response = await api.postToServer(Endpoint.SCENARIO_3(id), data);
    if (response.ok) {
      const { modelArtifacts, evaluationValues, trainLogs } = response.data;
      const trainedModel =
        await CustomIOHandler.getTrainedModelFromModelArtifacts(modelArtifacts);
      response.data = { trainedModel, evaluationValues, trainLogs };
    } else {
      console.error(
        `${response.message}: Something went wrong while uploading network`
      );
    }
    return response;
  }
  static async sendModelStructureAndTrainData(
    data: BmMLModelInfo,
    id: string
  ): Promise<
    BmMLApiResponse<{
      trainedModel: tf.Sequential | tf.LayersModel;
      trainLogs: tf.Logs[];
    }>
  > {
    const response = await api.postToServer(Endpoint.SCENARIO_4(id), data);
    if (response.ok) {
      const { modelArtifacts, trainLogs } = response.data;
      const trainedModel =
        await CustomIOHandler.getTrainedModelFromModelArtifacts(modelArtifacts);
      response.data = { trainedModel, trainLogs };
    } else {
      console.error(
        `${response.message}: Something went wrong while uploading network`
      );
    }
    return response;
  }
  static async sendModelArtifactsAndTestData(
    data: BmMLModelInfo,
    id: string
  ): Promise<
    BmMLApiResponse<{
      evaluationValues: [string, number][];
    }>
  > {
    const response = await api.postToServer(Endpoint.SCENARIO_2(id), data);
    if (response.ok) {
      console.log('Scenario 2 completed successfully');
    } else {
      console.error(
        `${response.message}: Something went wrong while uploading network`
      );
    }
    return response;
  }
  static async saveBenchmarkedModelConfig(nnId: string) {
    const state = store.getState();
    const nnList = state.neuralNetworks.nnList.slice();
    const indexToChange = state.neuralNetworks.nnList.findIndex((nn) => {
      return nn.id === nnId;
    });
    let dataSet: string = '';
    if (nnId === NN_1) {
      dataSet = 'Iris';
    }
    if (nnId === NN_2) {
      dataSet = 'Wine quality red';
    }
    if (nnId === NN_3) {
      dataSet = 'Wine quality white';
    }
    if (nnId === NN_4) {
      dataSet = 'Avila';
    }
    const response = await api.postToServer(
      Endpoint.BENCHMARK_CONFIG_SAVE(nnId),
      {
        params: nnList[indexToChange].params,
        dataSet: dataSet,
      }
    );
    if (response.ok) {
      console.log(response.data);
    } else {
      console.error(`${response.message}`);
    }
  }
}
