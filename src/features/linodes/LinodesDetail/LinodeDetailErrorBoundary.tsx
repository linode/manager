import * as Raven from 'raven-js';
import * as React from 'react';
import ErrorState from 'src/components/ErrorState';

interface State {
  error?: Error;
  info?: any;
}

export default <T extends {}>(Component: React.ComponentType) => {
  class LinodeDetailErrorBoundary extends React.Component<T, State> {
    state: State = {};

    componentDidCatch(error: Error, info: any) {
      this.setState({ error, info });

      Raven.captureException(error, { extra: info });
    }

    render() {
      if (this.state.error) {
        return (
          <ErrorState errorText="Opps! There was an unexpected error loading your Linode. Don't worry, we're looking into it." />
        );
      }

      return <Component {...this.props} />;
    }
  }


  return LinodeDetailErrorBoundary;
};

