import "./NoContentView.scss";

import * as React from "react";

interface BmMLNoContentViewProps {
  img?: string;
  caption: string;
}

const NoContentView = (props: BmMLNoContentViewProps): React.ReactElement => {
  return (
    <figure className='no-content'>
      <img src={props.img} alt='No content' />
      <figcaption>
        <h3>{props.caption}</h3>
      </figcaption>
    </figure>
  );
};

NoContentView.displayName = 'NoContentView';
export default NoContentView;
