/* eslint-disable  @typescript-eslint/no-unused-vars */
import "./NeuralNetworkInput.scss";

import classNames from "classnames";
import * as React from "react";

export interface BmMLNeuralNetworkInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
  labelClassName?: string;
}

export function NeuralNetworkInput(
  props: BmMLNeuralNetworkInputProps
): React.ReactElement {
  const { labelText, labelClassName, ...rest } = props;
  return props.labelText ? (
    <label className={props.labelClassName}>
      {props.labelText}
      <input {...rest} className={classNames('nn-input', props.className)} />
    </label>
  ) : (
    <input {...rest} className={classNames('nn-input', props.className)} />
  );
}
