import "./Button.scss";

import classNames from "classnames";
import * as React from "react";

export interface BmMLButton
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: string;
}

export function Button({
  theme = 'train',
  ...props
}: BmMLButton): React.ReactElement {
  return (
    <button
      {...props}
      btn-theme={theme}
      className={classNames('nn-button', props.className)}
    >
      {props.children}
    </button>
  );
}
