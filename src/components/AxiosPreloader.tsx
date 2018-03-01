import * as React from 'react';
import { AxiosPromise } from 'axios';
import CircleProgress from 'src/components/CircleProgress';

interface State {
  loading: Boolean;
}

export interface InjectedProps { }

export interface RequestMap<P> {
  [name: string]: (p: P) => AxiosPromise;
}

export default function preload<P>(requests: RequestMap<P>) {
  return function (Component: React.ComponentType<P & InjectedProps>) {
    /** */

    /** */
    return class AxiosLoadedComponent extends React.Component<P, State> {
      state = { loading: true };

      static displayName = `AxiosLoadedComponent(${Component.displayName || Component.name})`;

      componentDidMount() {
        const promises = Object
          .entries(requests)
          .map(([name, request]) => request(this.props)
            .then(response => [name, response.data]),
        );

        Promise
          .all(promises)
          .then((responses) => {
            responses.map(([key, value]) => {
              this.setState(prevState => ({ ...prevState, [key]: value }));
            });

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
