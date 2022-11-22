import "./TopBar.scss";

import classNames from "classnames";
import * as React from "react";

export interface BmMLTopBarProps {
  title: string;
  subtitle?: string;
  minor?: boolean;
  children?: unknown;
}

export default class TopBar extends React.Component<BmMLTopBarProps> {
  render(): React.ReactNode {
    return (
      <div className={classNames('topbar', { minor: this.props.minor })}>
        <div className='topbar__header-column'>
          {this.props.minor ? (
            <h3> {this.props.title}</h3>
          ) : (
            <h1> {this.props.title} </h1>
          )}
          {this.props.subtitle && (
            <p className='topbar__subtitle'> {this.props.subtitle} </p>
          )}
        </div>
        <div className='topbar__action-column'>{this.props.children}</div>
      </div>
    );
  }
}
