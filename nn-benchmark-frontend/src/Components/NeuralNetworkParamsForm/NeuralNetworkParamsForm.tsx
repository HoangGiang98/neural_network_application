import "./NeuralNetworkParamsForm.scss";

import { Button } from "Elements/Button/Button";
import React, { FormEvent } from "react";

export interface BmMLNeuralNetworkParamsFormProps<T> {
  onPositiveButton: (data: T) => void;
  positiveButtonText: string;
  children?: React.ReactNode[];
}

export function NeuralNetworkParamsForm<T>({
  positiveButtonText,
  onPositiveButton,
  children,
}: BmMLNeuralNetworkParamsFormProps<T>): React.ReactElement {
  const handleSubmit = <T extends unknown>(
    event: FormEvent,
    onPositiveButton: (data: T) => void
  ): void => {
    event.preventDefault();
    const returnObject = {};
    const form = event.target as HTMLFormElement;
    const elements = form.elements;
    for (let i = 0; i < elements.length; i++) {
      const element = elements.item(i) as HTMLInputElement;
      if (element) {
        if (element.type === 'checkbox') {
          returnObject[element.name] = element.checked;
        } else if (
          [
            'text',
            'date',
            'time',
            'textarea',
            'email',
            'number',
            'select-one',
          ].includes(element.type)
        ) {
          if (returnObject[element.name]) {
            const temp = returnObject[element.name];
            if (!Array.isArray(returnObject[element.name])) {
              returnObject[element.name] = [temp];
            } else {
              returnObject[element.name] = [...temp];
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            returnObject[element.name].push(
              isNaN(+element.value) ? element.value : +element.value
            );
          } else {
            returnObject[element.name] = isNaN(+element.value)
              ? element.value
              : +element.value;
          }
        }
      }
    }
    void onPositiveButton(returnObject as T);
  };

  return (
    <form
      onSubmit={(e: FormEvent): void => handleSubmit(e, onPositiveButton)}
      name='trainForm'
      className='nn-parameters-form'
      id='nn-parameters-form'
    >
      {children}
      <Button
        className='nn-button__configure-button'
        type='submit'
        id='configure'
      >
        {positiveButtonText}
      </Button>
    </form>
  );
}

export default NeuralNetworkParamsForm;
