import * as React from 'react';

import ErrorState from 'src/components/ErrorState';

interface State {
  error?: Error;
  info?: any;
}

const wrapper = <T extends {}>(Component: React.ComponentType) => {
  class SectionErrorBoundary extends React.Component<T> {
    state: State = {};

    componentDidCatch(error: Error, info: any) {
      this.setState({ error, info });
    }

    render() {
      if (this.state.error) {
        return <ErrorState errorText="" />;
      }

      return <Component {...this.props} />;
    }
  }

  return SectionErrorBoundary;
};

export default wrapper;
