import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';

interface State {
  loading: Boolean;
  [name: string]: any;
}

export interface TableRow<P> {
  [name: string]: (p: P) => Promise<any>;
}

export interface PromiseLoaderResponse<T> {
  response: T;
  error?: Error;
}

export default function preload<P>(requests: TableRow<P>) {
  return function (Component: React.ComponentType<P>) {
    return class AxiosLoadedComponent extends React.Component<P, State> {
      state = { loading: true };

      static displayName = `PromiseLoader(${Component.displayName || Component.name})`;

      componentDidMount() {
        const promises = Object
          .entries(requests)
          .map(([name, request]) =>
            request(this.props)
              .then((response) => {
                this.setState(prevState => ({
                  ...prevState,
                  [name]: { response },
                }));
              })
              .catch((response) => {
                this.setState(prevState => ({
                  ...prevState,
                  [name]: { error: true, response },
                }));
              }),
        );

        Promise
          .all(promises)
          .then((responses) => {
            this.setState(prevState => ({ ...prevState, loading: false }));
          })
          .catch(([key, error]) => {
            this.setState(prevState => ({ ...prevState, loading: false }));
          });
      }

      render() {
        const { loading, ...responses } = this.state;
        if (loading) {
          return <CircleProgress />;
        }

        return <Component {...this.props} {...responses} />;
      }
    };
  };
}
