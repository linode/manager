import * as React from 'react';
import ErrorState from 'src/components/ErrorState';
import { reportException } from 'src/exceptionReporting';

interface State {
  error?: Error;
  info?: any;
}

export default <T extends {}>(Component: React.ComponentType) => {
  class LinodeDetailErrorBoundary extends React.Component<T, State> {
    state: State = {};

    componentDidCatch(error: Error, info: any) {
      this.setState({ error, info });
      reportException(error, info);
    }

    render() {
      if (this.state.error) {
        return (
          <ErrorState errorText="Oops! There was an unexpected error loading your Linode. Don't worry, we're looking into it." />
        );
      }

      return <Component {...this.props} />;
    }
  }

  return LinodeDetailErrorBoundary;
};
