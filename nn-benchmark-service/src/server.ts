import SEndpoint from 'Api/ServerEndpoint';
import DataController from 'Controller/DataController';
import ModelController from 'Controller/ModelController';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { performance, PerformanceEntry, PerformanceObserver } from 'perf_hooks';
import DataService from 'Service/DataService';
import StormDB from 'stormdb';
import { BmMLApiError } from 'Types/types';

export const DATA_DIRECTORY = `${path.dirname(__dirname)}/data`;
export const API = '/api';

// DB
const engine = new StormDB.localFileEngine('./stormDB.json');
export const db = new StormDB(engine);
db.default({ benchmark: {} });

// Benchmark
const perfObserver = new PerformanceObserver((perfObserverList) => {
  const measureTypeEntry: PerformanceEntry[] =
    perfObserverList.getEntriesByType('measure');
  const { scenario, nnId } = measureTypeEntry[0].detail as {
    scenario: string;
    nnId: string;
  };
  const modPerfEntryList = measureTypeEntry.map((perfEntry) => {
    const { detail, startTime, duration, entryType, name } = perfEntry;
    return {
      name,
      entryType,
      startTime,
      duration,
      detail: { memoryUsage: (detail as any).memoryUsage },
    };
  });
  DataService.saveBenchmarkDataToDB(modPerfEntryList, nnId, scenario);
  performance.clearMarks();
});
perfObserver.observe({ entryTypes: ['measure'] });

// App
const app = express();

// for parsing application/json
app.use(express.json({ limit: '50mb' }));

// for parsing text/plain
app.use(express.text());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const PORT = process.env.PORT || 8080;

app.post(API + SEndpoint.SCENARIO_4, ModelController.handleScenario4);

app.post(API + SEndpoint.SCENARIO_3, ModelController.handleScenario3);

app.post(API + SEndpoint.SCENARIO_2, ModelController.handleScenario2);

app.post(
  API + SEndpoint.BENCHMARK_CONFIG_SAVE,
  ModelController.saveBenchmarkedModelConfig
);

app.post(API + SEndpoint.BENCHMARK_SAVE, DataController.saveBenchmarkData);

app.get(API + SEndpoint.BENCHMARK_RESET, DataController.resetBenchmarkData);

app.get(API + SEndpoint.BENCHMARK_GET, DataController.getBenchmarkData);

app.get(API + SEndpoint.DATA_LIST, DataController.getDataSetList);

app.get(API + SEndpoint.DATASET_INFO, DataController.getDataSetInfo);

app.get(API + SEndpoint.HEALTH, (req, res) => {
  res.json({
    server: 'Running',
  });
});

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  console.log('Production mode');
  // Have Node serve the files for our built React app
  app.use(express.static(path.resolve(__dirname, 'Static')));

  // All other GET requests not handled before will return our React app
  app.get('*', (req, res) => {
    console.log('Request received');
    res.sendFile(path.resolve(__dirname, 'Static', 'index.html'));
  });
}

/* Error handler middleware */
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: BmMLApiError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    console.error(err);
    res.status(statusCode).json({ message: err.message });
  }
);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
