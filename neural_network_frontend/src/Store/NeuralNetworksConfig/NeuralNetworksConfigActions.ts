import { Action, ActionCreator } from "redux";
import { BmMLNeuralNetworksConfig, BmMLScenario } from "Types/types";

/*
 * action types
 */
export enum BmMLNeuralNetworksConfigAction {
  RESET_NN_CONFIG_IN_STORE = '@@gvu/RESET_NN_CONFIG_IN_STORE',
  SAVE_NN_CONFIG_IN_STORE = '@@gvu/SAVE_NN_CONFIG_IN_STORE',
  SET_SELECTED_NN_IN_STORE = '@@gvu/SET_SELECTED_NN_IN_STORE',
  SAVE_SERVER_DATA_LIST = '@@gvu/SAVE_SERVER_DATA_LIST',
  SAVE_DATA_INTO_NN_CONFIG = '@@gvu/SAVE_DATA_INTO_NN_CONFIG',
  ADD_PERFORMANCE_ENTRIES_LIST = '@@gvu/ADD_PERFORMANCE_ENTRIES_LIST',
}

export interface BmMLSaveNeuralNetworkConfigAction extends Action {
  type: BmMLNeuralNetworksConfigAction.SAVE_NN_CONFIG_IN_STORE;
  neuralNetworkConfig: BmMLNeuralNetworksConfig;
}

export interface BmMLAddPerformanceEntriesListAction extends Action {
  type: BmMLNeuralNetworksConfigAction.ADD_PERFORMANCE_ENTRIES_LIST;
  performanceEntriesList: PerformanceEntryList[];
  id: string;
  scenario: BmMLScenario;
}

export interface BmMLResetNeuralNetworkConfigAction extends Action {
  type: BmMLNeuralNetworksConfigAction.RESET_NN_CONFIG_IN_STORE;
  configOptions?: Partial<BmMLNeuralNetworksConfig>;
  id: string;
}

export interface BmMLSaveDataIntoNeuralNetworkAction extends Action {
  type: BmMLNeuralNetworksConfigAction.SAVE_DATA_INTO_NN_CONFIG;
  data: Partial<BmMLNeuralNetworksConfig>;
  id: string;
}

export interface BmMLSetSelectedNeuralNetworkAction extends Action {
  type: BmMLNeuralNetworksConfigAction.SET_SELECTED_NN_IN_STORE;
  selectedNeuralNetworkConfig: BmMLNeuralNetworksConfig;
}

export interface BmMLSaveServerDataList extends Action {
  type: BmMLNeuralNetworksConfigAction.SAVE_SERVER_DATA_LIST;
  serverDataList: string[];
}

export type NeuralNetworksConfigActions =
  | BmMLResetNeuralNetworkConfigAction
  | BmMLSaveNeuralNetworkConfigAction
  | BmMLSetSelectedNeuralNetworkAction
  | BmMLSaveServerDataList
  | BmMLSaveDataIntoNeuralNetworkAction
  | BmMLAddPerformanceEntriesListAction;

export const resetNeuralNetworkConfig: ActionCreator<
  BmMLResetNeuralNetworkConfigAction
> = (id: string, configOptions?: Partial<BmMLNeuralNetworksConfig>) => ({
  type: BmMLNeuralNetworksConfigAction.RESET_NN_CONFIG_IN_STORE,
  id,
  configOptions,
});

export const setSelectedNeuralNetwork: ActionCreator<
  BmMLSetSelectedNeuralNetworkAction
> = (selectedNeuralNetworkConfig: BmMLNeuralNetworksConfig) => ({
  type: BmMLNeuralNetworksConfigAction.SET_SELECTED_NN_IN_STORE,
  selectedNeuralNetworkConfig,
});

export const saveNeuralNetworkConfig: ActionCreator<
  BmMLSaveNeuralNetworkConfigAction
> = (neuralNetworkConfig: BmMLNeuralNetworksConfig) => ({
  type: BmMLNeuralNetworksConfigAction.SAVE_NN_CONFIG_IN_STORE,
  neuralNetworkConfig,
});

export const addPerformanceEntriesList: ActionCreator<
  BmMLAddPerformanceEntriesListAction
> = (
  performanceEntriesList: PerformanceEntryList[],
  scenario: BmMLScenario,
  id: string
) => ({
  type: BmMLNeuralNetworksConfigAction.ADD_PERFORMANCE_ENTRIES_LIST,
  performanceEntriesList,
  scenario,
  id,
});

export const saveDataIntoConfig: ActionCreator<
  BmMLSaveDataIntoNeuralNetworkAction
> = (data: BmMLNeuralNetworksConfig, id: string) => ({
  type: BmMLNeuralNetworksConfigAction.SAVE_DATA_INTO_NN_CONFIG,
  data,
  id,
});

export const saveServerDataList: ActionCreator<BmMLSaveServerDataList> = (
  serverDataList: string[]
) => ({
  type: BmMLNeuralNetworksConfigAction.SAVE_SERVER_DATA_LIST,
  serverDataList,
});
