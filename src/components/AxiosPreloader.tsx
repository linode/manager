import * as React from 'react';
import { AxiosPromise } from 'axios';
import xs, { Subscription } from 'xstream';
import CircleProgress from 'src/components/CircleProgress';

interface State {
  loading: Boolean;
  responses?: any;
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
      state = { loading: true, responses: {} };

      subscription: Subscription;

      static displayName = `AxiosLoadedComponent(${Component.displayName || Component.name})`;

      componentDidMount() {
        const streams = Object
          .entries(requests)
          .map(([name, request]) =>
            xs.fromPromise(
              request(this.props)
                .then(response => [name, response.data]),
            ),
        );
        const responses = {};

        this.subscription = xs
          .merge(...streams)
          .startWith(['nada', { something: 'value' }])
          .subscribe({
            next: ([key, value]) => { responses[key] = value; },
            /** @todo Error handling like a responsible adult. */
            error: error => console.error(error),
            complete: () => {
              console.log('complete');
              this.setState(prevState => ({
                ...prevState,
                loading: false,
                responses,
              }));
            },
          });
      }

      componentWillUpdate() {
        this.subscription.unsubscribe();
      }

      render() {
        const { loading, responses } = this.state;
        if (loading) {
          return <CircleProgress />;
        }

        return <Component {...this.props} {...responses} />;
      }
    };
  };
}
