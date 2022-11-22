/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { db } from "server";
import ModelService from "Service/ModelService";
import { BmMLDataInfo, BmMLModelStructure, BmMLParameters } from "Types/types";
import BmML from "Utils/BmML";

import { io } from "@tensorflow/tfjs-core";
import * as tfn from "@tensorflow/tfjs-node";

async function handleScenario2(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { dataInfo, modelArtifacts, trainLogs } = req.body as {
      dataInfo: BmMLDataInfo;
      modelArtifacts: io.ModelArtifacts;
      trainLogs: tfn.Logs[];
    };
    const nnId = req.query.id as string;
    const { evaluationValues, dataTensors } =
      await ModelService.handleScenario2(
        dataInfo,
        modelArtifacts,
        trainLogs,
        nnId
      );
    res.status(200).send({
      evaluationValues,
    });
    BmML.memoryCleanUp({ removeVariables: true }, dataTensors);
  } catch (err: any) {
    console.error(`Error while executing scenario 2`, err.message);
    next(err);
  }
}

async function handleScenario3(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { selectedDataset, params, modelStructure } = req.body as {
      selectedDataset: string;
      params: BmMLParameters;
      modelStructure: BmMLModelStructure;
    };
    const nnId = req.query.id as string;
    const { modelArtifacts, evaluationValues, trainLogs, dataTensors } =
      await ModelService.handleScenario3(
        selectedDataset,
        params,
        modelStructure,
        nnId
      );
    res.status(200).send({
      modelArtifacts,
      evaluationValues,
      trainLogs,
    });
    BmML.memoryCleanUp({ removeVariables: true }, dataTensors);
  } catch (err: any) {
    console.error(`Error while executing scenario 3`, err.message);
    next(err);
  }
}

async function handleScenario4(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { dataInfo, modelStructure, params } = req.body as {
      dataInfo: BmMLDataInfo;
      modelStructure: BmMLModelStructure;
      params: BmMLParameters;
    };
    const nnId = req.query.id as string;
    const { modelArtifacts, trainLogs, dataTensors } =
      await ModelService.handleScenario4(
        dataInfo,
        modelStructure,
        params,
        nnId
      );
    res.status(200).send({
      modelArtifacts,
      trainLogs,
    });
    BmML.memoryCleanUp({ removeVariables: true }, dataTensors);
  } catch (err: any) {
    console.error(`Error while executing scenario 4`, err.message);
    next(err);
  }
}

function saveBenchmarkedModelConfig(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const data = req.body as {
      params: BmMLParameters;
      dataSet: string;
    };
    const { id } = req.query as {
      id: string;
    };
    if (!id) {
      throw new Error('Missing neural network id');
    }
    db.get('benchmark').get(id).set('config', data).save();
    res.status(200).send('Benchmarked model configuration saved to database');
  } catch (err: any) {
    console.error(
      `Error while saving benchmarked model configuration`,
      err.message
    );
    next(err);
  }
}

export default {
  handleScenario2,
  handleScenario3,
  handleScenario4,
  saveBenchmarkedModelConfig,
};
