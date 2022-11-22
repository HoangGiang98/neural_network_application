import { ConfigurationsIcon } from "Assets/index";
import NoContentView from "Elements/NoContentView/NoContentView";
import React from "react";

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: any, info: any) {
    // Display fallback UI
    console.log(error, info);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <NoContentView
          img={ConfigurationsIcon}
          caption='An error has occured'
        />
      );
    }
    return this.props.children;
  }
}
