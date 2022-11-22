/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { DATA_DIRECTORY, db } from "server";
import DataService from "Service/DataService";
import { BmMLScenario } from "Types/types";

function getDataSetList(req: Request, res: Response, next: NextFunction): void {
  try {
    const fileList = DataService.getDataSetList(DATA_DIRECTORY);
    res.status(200).send(fileList);
  } catch (err: any) {
    console.error(`Error while getting list of data set`, err.message);
    next(err);
  }
}

function getDataSetInfo(req: Request, res: Response, next: NextFunction): void {
  try {
    const { dataset, id } = req.query;
    const parsedData = DataService.getDataSetInfo(
      DATA_DIRECTORY,
      dataset as string,
      id as string
    );
    res.status(200).send({
      header: parsedData.header,
      classes: parsedData.classes,
      xDims: parsedData.xDims,
      numberOfClasses: parsedData.numberOfClasses,
    });
  } catch (err: any) {
    console.error(`Error while getting data set information`, err.message);
    next(err);
  }
}

function saveBenchmarkData(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const benchmarkData = req.body;
    const { id, scenario } = req.query as {
      id: string;
      scenario: BmMLScenario;
    };
    if (!id) {
      throw new Error('Missing neural network id');
    }
    if (!scenario) {
      throw new Error('Missing benchmark scenario');
    }
    if (scenario === 'scenario1') {
      DataService.saveBenchmarkDataToDB(benchmarkData, id, scenario);
    } else {
      DataService.addBenchmarkDataToLastElem(benchmarkData, id, scenario);
    }
    res.status(200).send('Benchmark data saved to database');
  } catch (err: any) {
    console.error(`Error while saving benchmark data`, err.message);
    next(err);
  }
}

function resetBenchmarkData(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const nnId = req.query.id as string;
    if (db.get('benchmark').get(nnId).value()) {
      db.get('benchmark').get(nnId).delete(false);
      db.save();
    }
    res.status(200).send('Benchmark data is reset');
  } catch (err: any) {
    console.error(`Error while resetting benchmark data`, err.message);
    next(err);
  }
}

function getBenchmarkData(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const nnId = req.query.id as string;
    const value = db.get('benchmark').get(nnId).value();
    if (!value) {
      throw new Error('No benchmark data found');
    }
    res.status(200).send(value);
  } catch (err: any) {
    console.error(`Error while resetting benchmark data`, err.message);
    next(err);
  }
}

export default {
  getDataSetList,
  getDataSetInfo,
  saveBenchmarkData,
  resetBenchmarkData,
  getBenchmarkData,
};
