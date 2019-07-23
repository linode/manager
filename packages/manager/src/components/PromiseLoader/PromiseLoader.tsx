import * as React from 'react';

import CircleProgress from 'src/components/CircleProgress';

interface State {
  loading: Boolean;
  [name: string]: any;
}

export interface RequestMap<P> {
  [name: string]: (p: P) => Promise<any>;
}

export interface PromiseLoaderResponse<T> {
  response: T;
  error?: Error;
}

/* tslint:disable */
export default function preload<P>(requests: RequestMap<P>) {
  return function(Component: React.ComponentType<P>) {
    /* tslint:enable */
    return class LoadedComponent extends React.Component<P, State> {
      mounted: boolean = false;
      state = { loading: true };

      static displayName = `PromiseLoader(${Component.displayName ||
        Component.name})`;

      componentWillUnmount() {
        this.mounted = false;
      }

      componentDidMount() {
        this.mounted = true;
        const promises = Object.entries(requests).map(([name, request]) =>
          request(this.props)
            .then(response => {
              if (!this.mounted) {
                return;
              }

              this.setState(prevState => ({
                ...prevState,
                [name]: { response }
              }));
            })
            .catch(response => {
              if (!this.mounted) {
                return;
              }

              this.setState(prevState => ({
                ...prevState,
                [name]: { error: true, response }
              }));
            })
        );

        Promise.all(promises)
          .then(responses => {
            if (!this.mounted) {
              return;
            }

            this.setState(prevState => ({ ...prevState, loading: false }));
          })
          .catch(([key, error]) => {
            if (!this.mounted) {
              return;
            }

            this.setState(prevState => ({ ...prevState, loading: false }));
          });
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
