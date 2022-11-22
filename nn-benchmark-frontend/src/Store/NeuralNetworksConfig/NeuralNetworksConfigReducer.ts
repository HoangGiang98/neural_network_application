import { Reducer } from "redux";
import {
  BmMLNeuralNetworksConfigAction,
  NeuralNetworksConfigActions
} from "Store/NeuralNetworksConfig/NeuralNetworksConfigActions";
import {
  BmMLActivation,
  BmMLNeuralNetworksConfig,
  BmMLParameters,
  BmMLScenario
} from "Types/types";

export interface BmMLNeuralNetworksStore {
  nnList: BmMLNeuralNetworksConfig[];
  selectedNeuralNetwork: BmMLNeuralNetworksConfig | undefined;
  serverDataList?: string[];
}

export const defaultParams: BmMLParameters = {
  testSplit: 0.05,
  epochs: 1,
  numberOfHiddenLayers: 1,
  layers: [
    {
      activation: BmMLActivation.SIGMOID,
      numberOfNeurons: 1,
    },
  ],
  outputActivation: BmMLActivation.SIGMOID,
};

export const defaultParams1: BmMLParameters = {
  testSplit: 0.4,
  epochs: 40,
  numberOfHiddenLayers: 2,
  layers: [
    {
      activation: BmMLActivation.SIGMOID,
      numberOfNeurons: 20,
    },
    {
      activation: BmMLActivation.SIGMOID,
      numberOfNeurons: 20,
    },
  ],
  outputActivation: BmMLActivation.SOFT_MAX,
};

const initialState: BmMLNeuralNetworksStore = {
  nnList: [
    {
      id: 'nn-1',
      // THIS IS ONLY TO TEST BENCHMARK QUICKER
      //data: DATA.IRIS,
      //data: DATA.IRIS_META,
      data: undefined,
      params: defaultParams,
      evaluationValues: undefined,
      trainedModel: undefined,
      inferenceResult: undefined,
      logits: undefined,
      benchmark: undefined,
      //selectedDataset: 'iris.csv',
    },
    {
      id: 'nn-2',
      // THIS IS ONLY TO TEST BENCHMARK QUICKER
      // data: DATA.WINE_RED,
      //data: DATA.WINE_RED_META,
      data: undefined,
      params: defaultParams,
      evaluationValues: undefined,
      trainedModel: undefined,
      inferenceResult: undefined,
      logits: undefined,
      benchmark: undefined,
      //selectedDataset: 'winequality-red.csv',
    },
    {
      id: 'nn-3',
      // THIS IS ONLY TO TEST BENCHMARK QUICKER
      // data: DATA.WINE_WHITE,
      //data: DATA.WINE_WHITE_META,
      data: undefined,
      params: defaultParams,
      evaluationValues: undefined,
      trainedModel: undefined,
      inferenceResult: undefined,
      logits: undefined,
      benchmark: undefined,
      //selectedDataset: 'winequality-white.csv',
    },
    {
      id: 'nn-4',
      // THIS IS ONLY TO TEST BENCHMARK QUICKER
      // data: DATA.AVILA,
      //data: DATA.AVILA_META,
      data: undefined,
      params: defaultParams,
      evaluationValues: undefined,
      trainedModel: undefined,
      inferenceResult: undefined,
      logits: undefined,
      benchmark: undefined,
      //selectedDataset: 'avila.csv',
    },
  ],
  selectedNeuralNetwork: undefined,
};

export const neuralNetworksConfigReducer: Reducer<BmMLNeuralNetworksStore> = (
  state: BmMLNeuralNetworksStore = initialState,
  action: NeuralNetworksConfigActions
): BmMLNeuralNetworksStore => {
  switch (action.type) {
    case BmMLNeuralNetworksConfigAction.SAVE_NN_CONFIG_IN_STORE:
      return {
        ...state,
        nnList: saveNeuralNetworkList(state, action.neuralNetworkConfig),
      };
    case BmMLNeuralNetworksConfigAction.RESET_NN_CONFIG_IN_STORE:
      return {
        ...state,
        nnList: resetNeuralNetworkConfig(
          state,
          action.id,
          action?.configOptions
        ),
      };
    case BmMLNeuralNetworksConfigAction.SET_SELECTED_NN_IN_STORE: {
      return {
        ...state,
        selectedNeuralNetwork: action.selectedNeuralNetworkConfig,
      };
    }
    case BmMLNeuralNetworksConfigAction.SAVE_SERVER_DATA_LIST: {
      return {
        ...state,
        serverDataList: action.serverDataList,
      };
    }
    case BmMLNeuralNetworksConfigAction.SAVE_DATA_INTO_NN_CONFIG: {
      return {
        ...state,
        nnList: saveDataIntoConfig(state, action.data, action.id),
      };
    }
    case BmMLNeuralNetworksConfigAction.ADD_PERFORMANCE_ENTRIES_LIST: {
      return {
        ...state,
        nnList: addPerformanceEntriesList(
          state,
          action.performanceEntriesList,
          action.scenario,
          action.id
        ),
      };
    }
    default:
      return state;
  }
};

function resetNeuralNetworkConfig(
  state: BmMLNeuralNetworksStore,
  id: string,
  configOptions?: Partial<BmMLNeuralNetworksConfig>
): BmMLNeuralNetworksConfig[] {
  const nnList = state.nnList.slice();
  const indexToChange = state.nnList.findIndex((nn) => {
    return nn.id === id;
  });
  if (configOptions) {
    nnList[indexToChange] = {
      ...initialState.nnList[indexToChange],
      ...configOptions,
    };
  } else {
    nnList[indexToChange] = {
      ...initialState.nnList[indexToChange],
    };
  }
  return nnList;
}

function saveDataIntoConfig(
  state: BmMLNeuralNetworksStore,
  data: Partial<BmMLNeuralNetworksConfig>,
  id: string
): BmMLNeuralNetworksConfig[] {
  const nnList = state.nnList.slice();
  const indexToChange = state.nnList.findIndex((nn) => {
    return nn.id === id;
  });
  const nnConfig = nnList[indexToChange];
  nnList[indexToChange] = Object.assign(nnConfig, data);
  return nnList;
}

function addPerformanceEntriesList(
  state: BmMLNeuralNetworksStore,
  performanceEntriesList: PerformanceEntryList[],
  scenario: BmMLScenario,
  id: string
): BmMLNeuralNetworksConfig[] {
  const nnList = state.nnList.slice();
  const indexToChange = state.nnList.findIndex((nn) => {
    return nn.id === id;
  });
  const nnConfig = nnList[indexToChange];
  if (nnConfig.benchmark === undefined) {
    nnConfig.benchmark = { [scenario]: performanceEntriesList };
    return nnList;
  }
  nnConfig.benchmark[scenario] = performanceEntriesList;
  return nnList;
}

function saveNeuralNetworkList(
  state: BmMLNeuralNetworksStore,
  neuralNetworkConfig: BmMLNeuralNetworksConfig
): BmMLNeuralNetworksConfig[] {
  const nnList = state.nnList.slice();
  const indexToChange = state.nnList.findIndex((nn) => {
    return nn.id === neuralNetworkConfig.id;
  });
  nnList[indexToChange] = Object.assign({}, neuralNetworkConfig);
  return nnList;
}
