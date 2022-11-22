import "./NeuraNetworkLink.scss";

import classNames from "classnames";
import { Link, useMatch } from "react-router-dom";

export interface BmMLNeuralNetworkLinkProps {
  destination: string;
  label: string;
}

export const NeuralNetworkLink = (props: BmMLNeuralNetworkLinkProps) => {
  const isSelected = useMatch(props.destination) !== null;
  return (
    <Link
      to={'/' + props.destination}
      className={classNames('neural-network__link', {
        '--selected': isSelected,
      })}
    >
      <h2>{props.label}</h2>
    </Link>
  );
};

export default NeuralNetworkLink;
