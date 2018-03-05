import * as React from 'react';
import { pick } from 'ramda';
import CircleProgress from 'src/components/CircleProgress';

interface State {
  loading: Boolean;
  [name: string]: any;
}

export interface PromiseMap<P> {
  [name: string]: (p: P) => Promise<any>;
}

export interface PromiseOptions {
  poll?: string[];
}

export interface PromiseLoaderResponse<T> {
  response: T;
  error?: Error;
}

export default function preload<P>(requests: PromiseMap<P>, options: PromiseOptions = {}) {
  return function (Component: React.ComponentType<P>) {
    return class PromiseLoadedComponent extends React.Component<P, State> {
      state = { loading: true };

      pollingInterval: number | null = null;

      static displayName = `PromiseLoader(${Component.displayName || Component.name})`;

      executePromises(requests: PromiseMap<P>) {
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

      componentDidMount() {
        this.executePromises(requests);
        if (options.poll) {
          const pollRequests = pick(options.poll, requests);
          this.pollingInterval = window.setInterval(
            () => this.executePromises(pollRequests), 5000,
          );
        }
      }

      componentWillUnmount() {
        if (this.pollingInterval) {
          window.clearInterval(this.pollingInterval);
        }
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
