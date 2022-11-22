import { ConfigurationsIcon } from "Assets/index";
import NeuralNetworkConfiguration from "Components/NeuralNetworkConfiguration/NeuralNetworkConfiguration";
import {
  NN_1,
  NN_2,
  NN_3,
  NN_4
} from "Components/NeuralNetworksManagement/NeuralNetworksList/NeuralNetworksList";
import NoContentView from "Elements/NoContentView/NoContentView";
import * as React from "react";
import { Route, Routes, useMatch } from "react-router-dom";

const RoutingTableSettingsManagement = (): React.ReactElement => (
  <Routes>
    <Route
      path='/'
      element={
        <NoContentView
          img={ConfigurationsIcon}
          caption='No neural networks was chosen'
        />
      }
    />
    <Route
      path={`/${NN_1}`}
      element={
        <NeuralNetworkConfiguration
          key={0}
          id={`${NN_1}`}
          name='Neural Network Configuration 1'
          isSelected={useMatch(NN_1) !== null}
        />
      }
    />
    <Route
      path={`/${NN_2}`}
      element={
        <NeuralNetworkConfiguration
          key={1}
          id={`${NN_2}`}
          name='Neural Network Configuration 2'
          isSelected={useMatch(NN_2) !== null}
        />
      }
    />
    <Route
      path={`/${NN_3}`}
      element={
        <NeuralNetworkConfiguration
          key={2}
          id={`${NN_3}`}
          name='Neural Network Configuration 3'
          isSelected={useMatch(NN_3) !== null}
        />
      }
    />
    <Route
      path={`/${NN_4}`}
      element={
        <NeuralNetworkConfiguration
          key={2}
          id={`${NN_4}`}
          name='Neural Network Configuration 3'
          isSelected={useMatch(NN_4) !== null}
        />
      }
    />
  </Routes>
);

RoutingTableSettingsManagement.displayName = 'RoutingTableSettingsManagement';
export default RoutingTableSettingsManagement;
