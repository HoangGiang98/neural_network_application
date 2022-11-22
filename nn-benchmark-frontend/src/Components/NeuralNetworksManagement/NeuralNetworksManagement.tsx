import "./NeuralNetworksManagement.scss";

import RoutingNeuralNetworksManagement from "Components/Routing/RoutingNeuralNetworksManagement";
import * as React from "react";

import NeuralNetworksList from "./NeuralNetworksList/NeuralNetworksList";

const NeuralNetworksManagement = (): React.ReactElement => {
  return (
    <div className='neural-networks-management'>
      <div className='neural-networks-management__content'>
        <NeuralNetworksList />
        <div className={'neural-networks-management__form'}>
          <RoutingNeuralNetworksManagement />
        </div>
      </div>
    </div>
  );
};

NeuralNetworksManagement.displayName = 'NeuralNetworksManagement';
export default NeuralNetworksManagement;
