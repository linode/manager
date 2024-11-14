import { CircleProgress } from '@linode/ui';
import * as React from 'react';

interface State {
  [name: string]: any;
  loading: boolean;
}

export interface RequestMap<P> {
  [name: string]: (p: P) => Promise<any>;
}

export interface PromiseLoaderResponse<T> {
  error?: Error;
  response: T;
}

/**
 * @deprecated Please don't use this. Use something like React Query instead.
 */
export default function preload<P>(requests: RequestMap<P>) {
  return function (Component: React.ComponentType<P>) {
    return class LoadedComponent extends React.Component<P, State> {
      static displayName = `PromiseLoader(${
        Component.displayName || Component.name
      })`;
      handleDone = () => {
        if (!this.mounted) {
          return;
        }

        this.setState((prevState) => ({ ...prevState, loading: false }));
      };

      mounted: boolean = false;

      state = { loading: true };

      componentDidMount() {
        this.mounted = true;
        const promises = Object.entries(requests).map(([name, request]) =>
          request(this.props)
            .then((response) => {
              if (!this.mounted) {
                return;
              }

              this.setState((prevState) => ({
                ...prevState,
                [name]: { response },
              }));
            })
            .catch((response) => {
              if (!this.mounted) {
                return;
              }

              this.setState((prevState) => ({
                ...prevState,
                [name]: { error: true, response },
              }));
            })
        );

        Promise.all(promises).then(this.handleDone).catch(this.handleDone);
      }

      componentWillUnmount() {
        this.mounted = false;
      }

      render() {
        const { loading, ...responses } = this.state;
        if (loading) {
          return <CircleProgress data-qa-circle-progress />;
        }

        return <Component {...this.props} {...responses} />;
      }
    };
  };
}
