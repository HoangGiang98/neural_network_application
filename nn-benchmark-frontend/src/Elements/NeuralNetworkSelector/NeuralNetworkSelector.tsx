import "./NeuralNetworkSelector.scss";

import classNames from "classnames";
import * as React from "react";

export interface BmMLNeuralNetworkSelectorProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  labelText: string;
  labelClassName: string;
  options: { value: string; label: string }[];
}

export function NeuralNetworkSelector(
  props: BmMLNeuralNetworkSelectorProps
): React.ReactElement {
  const { labelText, labelClassName, options, ...rest } = props;
  return (
    <label className={labelClassName}>
      {labelText}
      <select {...rest} className={classNames('nn-selector', props.className)}>
        {options.map((option, id) => (
          <option key={id} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
