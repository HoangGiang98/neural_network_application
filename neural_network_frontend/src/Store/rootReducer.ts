import { combineReducers } from "redux";
import {
  BmMLNeuralNetworksStore,
  neuralNetworksConfigReducer
} from "Store/NeuralNetworksConfig/NeuralNetworksConfigReducer";

export interface BmMLApplicationState {
  neuralNetworks: BmMLNeuralNetworksStore;
}

export const rootReducer = combineReducers<BmMLApplicationState>({
  neuralNetworks: neuralNetworksConfigReducer,
});
