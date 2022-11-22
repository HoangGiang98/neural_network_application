import fse from "fs-extra";
import { PerformanceEntry } from "perf_hooks";
import { db } from "server";
import { BmMLParsedData } from "Types/types";
import DataHandler from "Utils/DataHandler";

const getDataSetList = (dataDir: string): string[] => {
  fse.ensureDirSync(dataDir);
  return fse
    .readdirSync(dataDir, { withFileTypes: true })
    .filter((item) => !item.isDirectory() && item.name.endsWith('.csv'))
    .map((item) => item.name);
};
const getDataSetInfo = (
  dataDir: string,
  dataSet: string,
  id: string
): BmMLParsedData => {
  const pathToFile = `${dataDir}/${dataSet}`;
  const csvData = DataHandler.getLocalCsvData(pathToFile);
  const parsedData = DataHandler.parseCsvData(csvData);
  if (parsedData === undefined) {
    throw new Error('Data could not be parsed');
  }
  void db.set(`${id}.${dataSet}`, parsedData).save();
  return parsedData;
};

const saveBenchmarkDataToDB = (
  benchmarkData: PerformanceEntry[],
  nnId: string,
  scenario: string
) => {
  if (!benchmarkData) {
    throw new Error('Benchmark data missing');
  }
  const neuralNetwork = db.get('benchmark').get(nnId);
  if (!neuralNetwork.value()) {
    db.get('benchmark')
      .set([nnId], { [scenario]: [benchmarkData] })
      .save();
    return;
  }
  const scenarioBm = neuralNetwork.get(scenario);
  if (!scenarioBm.value()) {
    db.get('benchmark').get(nnId).set(scenario, [benchmarkData]).save();
    return;
  }
  scenarioBm.push(benchmarkData);
  db.save();
};

const addBenchmarkDataToLastElem = (
  benchmarkData: PerformanceEntry[],
  nnId: string,
  scenario: string
) => {
  if (!benchmarkData) {
    throw new Error('Benchmark data missing');
  }
  const neuralNetwork = db.get('benchmark').get(nnId);
  if (!neuralNetwork.value()) {
    throw new Error('There is no neural network with this id');
  }
  const scenarioBmData = neuralNetwork.get(scenario).value();
  if (!scenarioBmData) {
    throw new Error('There is no data for this scenario');
  }
  scenarioBmData[scenarioBmData.length - 1].unshift(...benchmarkData);
  neuralNetwork.set(scenario, scenarioBmData);
  db.save();
};
export default {
  getDataSetList,
  getDataSetInfo,
  saveBenchmarkDataToDB,
  addBenchmarkDataToLastElem,
};
