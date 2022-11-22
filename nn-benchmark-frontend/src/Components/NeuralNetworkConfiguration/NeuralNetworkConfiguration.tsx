import "./NeuralNetworkConfiguration.scss";

import DataApi from "Api/Rest/DataApi";
import { NeuralNetworkParamsForm } from "Components/NeuralNetworkParamsForm/NeuralNetworkParamsForm";
import { Button } from "Elements/Button/Button";
import DataTable from "Elements/DataTable/DataTable";
import { NeuralNetworkInput } from "Elements/NeuralNetworkInput/NeuralNetworkInput";
import { NeuralNetworkSelector } from "Elements/NeuralNetworkSelector/NeuralNetworkSelector";
import Papa from "papaparse";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Collapsible from "react-collapsible";
import { useDispatch, useSelector } from "react-redux";
import {
  resetNeuralNetworkConfig,
  saveNeuralNetworkConfig,
  setSelectedNeuralNetwork
} from "Store/NeuralNetworksConfig/NeuralNetworksConfigActions";
import { BmMLApplicationState } from "Store/rootReducer";
import {
  BmMLActivation,
  BmMLLayerConfig,
  BmMLMark,
  BmMLNeuralNetworksConfig,
  BmMLParameters,
  BmMLParametersName
} from "Types/types";
import BmML from "Utils/BmML";
import {
  cloneMemoryInfo,
  clonePerformanceMeasure,
  extractData
} from "Utils/DataHandler";
import Logger from "Utils/LoggerHandler";

export interface BmMLNeuralNetworkConfigProps {
  id: string;
  name: string;
  isSelected: boolean;
}

const NeuralNetworkConfiguration = (
  props: BmMLNeuralNetworkConfigProps
): React.ReactElement => {
  const {
    EPOCHS,
    TEST_SPLIT,
    ACTIVATION,
    NEURONS_NUMBER,
    HIDDEN_LAYERS_NUMBER,
    LAYERS,
    OUTPUT_ACTIVATION,
  } = BmMLParametersName;
  const { PROCESS_DATA, EXEC_SCENARIO, START, END } = BmMLMark;

  const activationOptions = Object.entries(BmMLActivation).map(([key, val]) => {
    return { value: val, label: key };
  });
  const neuralNetworkConfig = useSelector((state: BmMLApplicationState) =>
    state.neuralNetworks.nnList.find((nn) => nn.id === props.id)
  );
  const serverDataList = useSelector(
    (state: BmMLApplicationState) => state.neuralNetworks.serverDataList
  );

  const serverDataOptions = serverDataList
    ? [
        { value: '', label: '-' },
        ...serverDataList.map((data) => {
          return { value: data, label: data };
        }),
      ]
    : [];

  const [params, setParams] = useState(neuralNetworkConfig?.params);
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.isSelected) {
      dispatch(setSelectedNeuralNetwork(neuralNetworkConfig));
    }
  }, [props.isSelected, neuralNetworkConfig, dispatch]);

  useEffect(() => {
    Logger.collapsedLog('Load data complete', neuralNetworkConfig?.data);
  }, [neuralNetworkConfig?.data]);

  useEffect(() => {
    Logger.collapsedLog(
      'Configure parameters complete',
      neuralNetworkConfig?.params
    );
  }, [neuralNetworkConfig?.params]);

  useEffect(() => {
    if (!neuralNetworkConfig?.inferenceResult || !neuralNetworkConfig?.logits) {
      return;
    }
    Logger.logGroupWrapper('Inference complete', () => {
      Logger.collapsedLog(
        'Inference result',
        neuralNetworkConfig?.inferenceResult
      );
      Logger.collapsedLog('Logits', neuralNetworkConfig?.logits);
    });
  }, [neuralNetworkConfig?.inferenceResult, neuralNetworkConfig?.logits]);

  useEffect(() => {
    Logger.collapsedLog('Training logs', neuralNetworkConfig?.trainLogs);
  }, [neuralNetworkConfig?.trainLogs]);

  useEffect(() => {
    if (
      !neuralNetworkConfig?.trainedModel ||
      !neuralNetworkConfig?.evaluationValues
    ) {
      return;
    }
    Logger.logGroupWrapper('Train/Test complete', () => {
      Logger.collapsedLog('Trained model', neuralNetworkConfig?.trainedModel);
      console.groupCollapsed('Model summary');
      neuralNetworkConfig?.trainedModel?.summary();
      console.groupEnd();
      Logger.collapsedLog(
        'Evaluation values',
        neuralNetworkConfig?.evaluationValues
      );
    });
  }, [
    neuralNetworkConfig?.trainedModel,
    neuralNetworkConfig?.evaluationValues,
  ]);

  const handleData = (event: FormEvent): void => {
    if (typeof window.FileReader !== 'function') {
      throw new Error("The file API isn't supported on this browser.");
    }
    const input = event.target as HTMLInputElement;
    if (!input) {
      throw new Error(
        'The browser does not properly implement the event object'
      );
    }
    if (!input.files) {
      throw new Error(
        'This browser does not support the `files` property of the file input.'
      );
    }
    if (!input.files[0]) {
      return undefined;
    }
    const file = input.files[0];
    Papa.parse(file, {
      complete: function (results) {
        const data = extractData(results as Papa.ParseResult<unknown[]>);
        BmML.memoryCleanUp(
          { removeVariables: true },
          neuralNetworkConfig?.dataTensors
        );
        dispatch(
          resetNeuralNetworkConfig(neuralNetworkConfig?.id, {
            params,
            data,
          })
        );
        input.value = '';
      },
      dynamicTyping: true,
      skipEmptyLines: true,
    });
  };

  const handleServerData = async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedDataset = event.target.value;
    if (selectedDataset === '') {
      BmML.memoryCleanUp(
        { removeVariables: true },
        neuralNetworkConfig?.dataTensors
      );
      dispatch(
        resetNeuralNetworkConfig(neuralNetworkConfig?.id, {
          params,
        })
      );
      return;
    }
    if (!neuralNetworkConfig) {
      throw new Error('No neural network model available');
    }
    const { data } = await DataApi.getDatasetInfo(
      neuralNetworkConfig?.id,
      selectedDataset
    );
    if (!data) {
      throw new Error('No dataset information received');
    }
    BmML.memoryCleanUp(
      { removeVariables: true },
      neuralNetworkConfig?.dataTensors
    );
    dispatch(
      resetNeuralNetworkConfig(neuralNetworkConfig?.id, {
        params,
        data,
        selectedDataset,
        benchmark: neuralNetworkConfig.benchmark,
      })
    );
  };

  const handleChange = (event: FormEvent) => {
    event.preventDefault();
    const { name, value } = event.target as HTMLInputElement;
    if (params === undefined) {
      return;
    }
    setParams({
      ...params,
      [name]: +value,
    });
  };

  const handleConfigureParams = (params: BmMLParameters) => {
    let layers: BmMLLayerConfig[] = [];
    const neurons = params[NEURONS_NUMBER];
    const activations = params[ACTIVATION];
    if (Array.isArray(neurons) && Array.isArray(activations)) {
      layers = neurons.map((e: number, index: number) => {
        return {
          [NEURONS_NUMBER]: e,
          [ACTIVATION]: activations[index],
        };
      });
    } else if (neurons !== undefined && activations !== undefined) {
      layers.push({
        [NEURONS_NUMBER]: neurons,
        [ACTIVATION]: activations,
      });
    }
    params[LAYERS] = layers;
    delete params[NEURONS_NUMBER] && delete params[ACTIVATION];
    dispatch(
      saveNeuralNetworkConfig({
        ...neuralNetworkConfig,
        params: params,
      })
    );
  };

  const handlePredict = (inputs: unknown[]) => {
    if (neuralNetworkConfig?.trainedModel === undefined) {
      throw new Error('ERROR: Please load or train model first.');
    }
    if (neuralNetworkConfig.data?.classes === undefined) {
      throw new Error('ERROR: Please load data first.');
    }
    if (neuralNetworkConfig.data?.header === undefined) {
      throw new Error('ERROR: Please load data first.');
    }

    const predictInputs = neuralNetworkConfig.data.header
      .slice(0, -1)
      .map((head) => {
        return inputs[head];
      });

    const [logits, winner] = BmML.predictOnManualInput(
      neuralNetworkConfig.trainedModel,
      predictInputs,
      neuralNetworkConfig.data.classes
    );
    dispatch(
      saveNeuralNetworkConfig({
        ...neuralNetworkConfig,
        inferenceResult: winner,
        logits: logits,
      })
    );
  };

  const handleScenario1 = async (
    neuralNetworkConfig: BmMLNeuralNetworksConfig | undefined
  ) => {
    if (
      neuralNetworkConfig?.data?.body === undefined ||
      neuralNetworkConfig.params === undefined
    ) {
      return;
    }
    if (neuralNetworkConfig.trainedModel || neuralNetworkConfig.dataTensors) {
      BmML.memoryCleanUp(
        { removeVariables: true },
        neuralNetworkConfig.dataTensors
      );
    }
    performance.mark(START);
    // performance.mark(PROCESS_DATA + START);
    const [trainInfo, testInfo] = BmML.getSetData(
      neuralNetworkConfig.params.testSplit,
      neuralNetworkConfig.data.body,
      neuralNetworkConfig.data.numberOfClasses
    );
    performance.mark(PROCESS_DATA + END);
    const dMemory = cloneMemoryInfo(performance.memory);

    const { trainedModel, evaluationValues, trainLogs } =
      await BmML.executeScenario1(
        trainInfo,
        testInfo,
        neuralNetworkConfig.params,
        neuralNetworkConfig.data
      );
    performance.mark(EXEC_SCENARIO + END);
    const eMemory = cloneMemoryInfo(performance.memory);
    const dataTensors = [
      trainInfo.xTensors,
      trainInfo.yTensors,
      testInfo.xTensors,
      testInfo.yTensors,
    ];

    performance.measure(PROCESS_DATA, {
      start: START,
      end: PROCESS_DATA + END,
      detail: { memoryUsage: dMemory },
    });
    performance.measure(EXEC_SCENARIO, {
      start: START,
      end: EXEC_SCENARIO + END,
      detail: { memoryUsage: eMemory },
    });
    dispatch(
      saveNeuralNetworkConfig({
        ...neuralNetworkConfig,
        evaluationValues,
        trainedModel,
        trainLogs,
        dataTensors,
      })
    );
    await DataApi.saveBenchmarkData(
      neuralNetworkConfig.id,
      'scenario1',
      clonePerformanceMeasure(performance.getEntriesByType('measure'))
    );
    performance.clearMeasures();
    performance.clearMarks();
  };

  const handleScenario2 = async (
    neuralNetworkConfig: BmMLNeuralNetworksConfig | undefined
  ) => {
    if (
      neuralNetworkConfig?.data?.body === undefined ||
      neuralNetworkConfig.params === undefined
    ) {
      return;
    }
    if (neuralNetworkConfig.trainedModel || neuralNetworkConfig.dataTensors) {
      BmML.memoryCleanUp(
        { removeVariables: true },
        neuralNetworkConfig.dataTensors
      );
    }
    performance.mark(START);
    // performance.mark(PROCESS_DATA + START);
    const [trainInfo, testInfo] = BmML.getSetData(
      neuralNetworkConfig.params.testSplit,
      neuralNetworkConfig.data.body,
      neuralNetworkConfig.data.numberOfClasses
    );
    performance.mark(PROCESS_DATA + END);
    const dMemory = cloneMemoryInfo(performance.memory);

    const { trainedModel, evaluationValues, trainLogs } =
      await BmML.executeScenario2(
        trainInfo,
        testInfo,
        neuralNetworkConfig.params,
        neuralNetworkConfig.data,
        neuralNetworkConfig.id
      );
    performance.mark(EXEC_SCENARIO + END);
    const eMemory = cloneMemoryInfo(performance.memory);

    const dataTensors = [
      trainInfo.xTensors,
      trainInfo.yTensors,
      testInfo.xTensors,
      testInfo.yTensors,
    ];
    performance.measure(PROCESS_DATA, {
      start: START,
      end: PROCESS_DATA + END,
      detail: { memoryUsage: dMemory },
    });
    performance.measure(EXEC_SCENARIO, {
      start: START,
      end: EXEC_SCENARIO + END,
      detail: { memoryUsage: eMemory },
    });
    dispatch(
      saveNeuralNetworkConfig({
        ...neuralNetworkConfig,
        evaluationValues,
        trainedModel,
        trainLogs,
        dataTensors,
      })
    );
    await DataApi.saveBenchmarkData(
      neuralNetworkConfig.id,
      'scenario2',
      clonePerformanceMeasure(performance.getEntriesByType('measure'))
    );
    performance.clearMeasures();
    performance.clearMarks();
  };

  const handleScenario3 = async (
    neuralNetworkConfig: BmMLNeuralNetworksConfig | undefined
  ) => {
    if (
      neuralNetworkConfig?.selectedDataset === undefined ||
      neuralNetworkConfig.data === undefined ||
      neuralNetworkConfig.data.body !== undefined ||
      neuralNetworkConfig.params === undefined
    ) {
      return;
    }
    if (neuralNetworkConfig.trainedModel || neuralNetworkConfig.dataTensors) {
      BmML.memoryCleanUp(
        { removeVariables: true },
        neuralNetworkConfig.dataTensors
      );
    }

    performance.mark(EXEC_SCENARIO + START);
    const { trainedModel, evaluationValues, trainLogs } =
      await BmML.executeScenario3(
        neuralNetworkConfig.selectedDataset,
        neuralNetworkConfig.params,
        neuralNetworkConfig.data,
        neuralNetworkConfig.id
      );
    performance.mark(EXEC_SCENARIO + END);
    const eMemory = cloneMemoryInfo(performance.memory);
    performance.measure(EXEC_SCENARIO, {
      start: EXEC_SCENARIO + START,
      end: EXEC_SCENARIO + END,
      detail: { memoryUsage: eMemory },
    });
    dispatch(
      saveNeuralNetworkConfig({
        ...neuralNetworkConfig,
        evaluationValues,
        trainedModel,
        trainLogs,
      })
    );
    await DataApi.saveBenchmarkData(
      neuralNetworkConfig.id,
      'scenario3',
      clonePerformanceMeasure(performance.getEntriesByType('measure'))
    );
    performance.clearMeasures();
    performance.clearMarks();
  };

  const handleScenario4 = async (
    neuralNetworkConfig: BmMLNeuralNetworksConfig | undefined
  ) => {
    if (
      neuralNetworkConfig?.data?.body === undefined ||
      neuralNetworkConfig.params === undefined
    ) {
      return;
    }
    if (neuralNetworkConfig.trainedModel || neuralNetworkConfig.dataTensors) {
      BmML.memoryCleanUp(
        { removeVariables: true },
        neuralNetworkConfig.dataTensors
      );
    }
    performance.mark(START);
    // performance.mark(PROCESS_DATA + START);
    const [trainInfo, testInfo] = BmML.getSetData(
      neuralNetworkConfig.params.testSplit,
      neuralNetworkConfig.data.body,
      neuralNetworkConfig.data.numberOfClasses
    );
    performance.mark(PROCESS_DATA + END);
    const dMemory = cloneMemoryInfo(performance.memory);

    const { trainedModel, evaluationValues, trainLogs } =
      await BmML.executeScenario4(
        trainInfo,
        testInfo,
        neuralNetworkConfig.params,
        neuralNetworkConfig.data,
        neuralNetworkConfig.id
      );
    performance.mark(EXEC_SCENARIO + END);
    const eMemory = cloneMemoryInfo(performance.memory);

    performance.measure(PROCESS_DATA, {
      start: START,
      end: PROCESS_DATA + END,
      detail: { memoryUsage: dMemory },
    });
    performance.measure(EXEC_SCENARIO, {
      start: START,
      end: EXEC_SCENARIO + END,
      detail: { memoryUsage: eMemory },
    });
    const dataTensors = [
      trainInfo.xTensors,
      trainInfo.yTensors,
      testInfo.xTensors,
      testInfo.yTensors,
    ];
    dispatch(
      saveNeuralNetworkConfig({
        ...neuralNetworkConfig,
        evaluationValues,
        trainedModel,
        trainLogs,
        dataTensors,
      })
    );
    await DataApi.saveBenchmarkData(
      neuralNetworkConfig.id,
      'scenario4',
      clonePerformanceMeasure(performance.getEntriesByType('measure'))
    );
    performance.clearMeasures();
    performance.clearMarks();
  };

  return (
    <div id={props.id} className='neural-network-config'>
      <div className='nn-config-header'>
        <h1>{props.name}</h1>
      </div>
      <div className='nn-section nn-data'>
        <h3>Handle Data</h3>
        <div className='nn-wrapper'>
          <NeuralNetworkInput
            labelClassName='nn-data'
            labelText='Get local files'
            type='file'
            onChange={handleData}
            name='localCsvFile'
            accept='.csv'
          />
          <NeuralNetworkSelector
            labelClassName='nn-data'
            labelText='Choose dataset on server'
            options={serverDataOptions}
            value={
              neuralNetworkConfig?.selectedDataset
                ? neuralNetworkConfig.selectedDataset
                : undefined
            }
            onChange={handleServerData}
            required
          ></NeuralNetworkSelector>
        </div>
        <div className='data-table-wrapper'>
          <div className='nn-classes'>
            <div className='nn-classes--cell nn-classes__header'>
              Classification
            </div>
            {neuralNetworkConfig?.data &&
              neuralNetworkConfig.data.classes &&
              neuralNetworkConfig.data.classes.length !== 0 &&
              neuralNetworkConfig.data.classes.map(
                (parsedClass, classIndex) => (
                  <div
                    className='nn-classes--cell nn-classes__label'
                    key={classIndex}
                  >
                    {parsedClass}
                  </div>
                )
              )}
          </div>
          <Collapsible trigger='Data' classParentString='nn-collapsible'>
            {neuralNetworkConfig?.data && (
              <DataTable parsedCsvData={neuralNetworkConfig.data} />
            )}
          </Collapsible>
        </div>
      </div>
      <div className='nn-section nn-configurations'>
        <h3>Configure Parameters</h3>
        <NeuralNetworkParamsForm
          positiveButtonText='Configure'
          onPositiveButton={handleConfigureParams}
        >
          <NeuralNetworkInput
            labelClassName='nn-config'
            labelText='Test Split'
            type='number'
            placeholder='0 to 1'
            defaultValue={params ? params.testSplit : undefined}
            name={TEST_SPLIT}
            step='0.05'
            min='0.05'
            max='1'
            required
          />
          <NeuralNetworkInput
            labelClassName='nn-config'
            labelText=' Number of Epochs'
            type='number'
            placeholder='Positive integer'
            defaultValue={params ? params.epochs : undefined}
            name={EPOCHS}
            step='1'
            min='1'
            required
          />
          <NeuralNetworkSelector
            labelText='Output Activation'
            labelClassName='nn-config'
            options={activationOptions}
            name={OUTPUT_ACTIVATION}
            defaultValue={
              params ? params.outputActivation : BmMLActivation.SIGMOID
            }
            required
          ></NeuralNetworkSelector>
          <NeuralNetworkInput
            labelClassName='nn-config'
            labelText='Number of hidden Layers'
            type='number'
            placeholder='Positive integer'
            defaultValue={params ? params.numberOfHiddenLayers : undefined}
            onChange={handleChange}
            name={HIDDEN_LAYERS_NUMBER}
            min='1'
            step='1'
            required
          />
          {params &&
            params.numberOfHiddenLayers > 0 &&
            [...Array(params.numberOfHiddenLayers).keys()].map((layerId) => (
              <div
                className='nn-wrapper'
                key={layerId}
                id={`layer-config-${layerId}`}
              >
                <NeuralNetworkInput
                  labelClassName='nn-neuro-config'
                  labelText='Number of Neurons'
                  type='number'
                  defaultValue={
                    params.layers[layerId]
                      ? params.layers[layerId].numberOfNeurons
                      : 1
                  }
                  name={NEURONS_NUMBER}
                  step='1'
                  min='1'
                  required
                />
                <NeuralNetworkSelector
                  labelText='Activation Function'
                  labelClassName='nn-activ-config'
                  options={activationOptions}
                  name={ACTIVATION}
                  className='nn-activation-selector'
                  defaultValue={
                    params.layers[layerId]
                      ? params.layers[layerId].activation
                      : BmMLActivation.SIGMOID
                  }
                  required
                ></NeuralNetworkSelector>
              </div>
            ))}
        </NeuralNetworkParamsForm>
      </div>
      <div className='nn-section nn-train-test'>
        <h3>Train/Test Model</h3>
        <div className='nn-wrapper'>
          <Button
            className='nn-button__train-button'
            type='submit'
            id='scenario-1'
            onClick={async (event: FormEvent) => {
              event.preventDefault();
              await handleScenario1(neuralNetworkConfig);
            }}
            disabled={
              neuralNetworkConfig?.data === undefined ||
              neuralNetworkConfig.params === undefined ||
              neuralNetworkConfig.selectedDataset !== undefined
            }
          >
            Scenario 1
          </Button>
          <Button
            className='nn-button__train-button'
            type='submit'
            id='scenario-2'
            onClick={async (event: FormEvent) => {
              event.preventDefault();
              await handleScenario2(neuralNetworkConfig);
            }}
            disabled={
              neuralNetworkConfig?.data === undefined ||
              neuralNetworkConfig.params === undefined ||
              neuralNetworkConfig.selectedDataset !== undefined
            }
          >
            Scenario 2
          </Button>
          <Button
            className='nn-button__test-button'
            type='submit'
            id='scenario-3'
            onClick={async (event: FormEvent) => {
              event.preventDefault();
              await handleScenario3(neuralNetworkConfig);
            }}
            disabled={
              neuralNetworkConfig?.selectedDataset === undefined ||
              neuralNetworkConfig.params === undefined
            }
          >
            Scenario 3
          </Button>
          <Button
            className='nn-button__test-button'
            type='submit'
            id='scenario-4'
            onClick={async (event: FormEvent) => {
              event.preventDefault();
              await handleScenario4(neuralNetworkConfig);
            }}
            disabled={
              neuralNetworkConfig?.data === undefined ||
              neuralNetworkConfig.params === undefined ||
              neuralNetworkConfig.selectedDataset !== undefined
            }
          >
            Scenario 4
          </Button>
        </div>
      </div>
      <div className='nn-section nn-output'>
        <h3>Output</h3>
        <div className='nn-wrapper'>
          {neuralNetworkConfig?.evaluationValues &&
            neuralNetworkConfig?.evaluationValues.map((ev, id) => (
              <NeuralNetworkInput
                key={id}
                labelClassName='nn-eval'
                labelText={ev[0]}
                value={ev[1] === undefined ? 'N/A' : +ev[1].toFixed(4)}
                readOnly
              />
            ))}
        </div>
      </div>
      <div className='nn-section nn-inference'>
        <h3>Inference</h3>
        {neuralNetworkConfig?.trainedModel && neuralNetworkConfig.data?.header && (
          <NeuralNetworkParamsForm
            positiveButtonText='Predict'
            onPositiveButton={handlePredict}
          >
            {neuralNetworkConfig.data.header.map((cate, id, arr) => {
              const isLastElem = id === arr.length - 1;
              return (
                <NeuralNetworkInput
                  key={id}
                  labelClassName={
                    isLastElem ? 'nn-inference__result' : 'nn-inference__input'
                  }
                  labelText={cate}
                  placeholder={
                    isLastElem
                      ? neuralNetworkConfig.data?.classes.join(', ')
                      : undefined
                  }
                  value={
                    isLastElem
                      ? neuralNetworkConfig?.inferenceResult || ''
                      : undefined
                  }
                  name={cate}
                  readOnly={isLastElem ? true : undefined}
                />
              );
            })}
          </NeuralNetworkParamsForm>
        )}
      </div>
    </div>
  );
};

export default NeuralNetworkConfiguration;
