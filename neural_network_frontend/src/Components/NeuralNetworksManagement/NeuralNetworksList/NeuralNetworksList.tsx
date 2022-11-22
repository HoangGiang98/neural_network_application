import "./NeuralNetworksList.scss";

import TopBar from "Elements/TopBar/TopBar";
import * as React from "react";

import { NeuralNetworkLink } from "./NeuralNetworkLink/NeuralNetworkLink";

export const [NN_1, NN_2, NN_3, NN_4] = ['nn-1', 'nn-2', 'nn-3', 'nn-4'];

const NeuralNetworksList: React.FunctionComponent = (): React.ReactElement => {
  function header(): React.ReactNode {
    return (
      <div className='neural-network-sidebar-list__header'>
        <TopBar title={'Neural Networks'}></TopBar>
      </div>
    );
  }

  function list(): React.ReactNode {
    return (
      <div className='neural-networks-list'>
        <NeuralNetworkLink label='Neural network 1' destination={NN_1} />
        <NeuralNetworkLink label='Neural network 2' destination={NN_2} />
        <NeuralNetworkLink label='Neural network 3' destination={NN_3} />
        <NeuralNetworkLink label='Neural network 4' destination={NN_4} />
      </div>
    );
  }
  return (
    <div className='neural-network-management__neural-network-list'>
      <nav className='neural-network-sidebar-list'>
        {header()}
        {list()}
      </nav>
    </div>
  );
};

export default NeuralNetworksList;
