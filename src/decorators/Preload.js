import React, { Component } from 'react';
import ComponentLoader from '~/components/loaders/ComponentLoader';
import PageLoader from '~/components/loaders/PageLoader';
import invariant from 'invariant';

const CONFIG_DEFAULTS = { delay: 0 };

/**
 * @typedef {Object} PreloadConfig
 * @property {Component} loader
 * @property {Promise} method
 * @property {Number} [delay]
 *
 * @param {PreloadConfig} config
 */
const Preload = (config) => (Child) => {
  const {
    loader: LoadingComponent,
    delay,
    method,
  } = Object.assign({}, config, CONFIG_DEFAULTS);

  return class PreloadedComponent extends Component {
    constructor(props) {
      super(props);
      const { dispatch, ...rest } = props;

      // eslint-disable-next-line max-len
      invariant(dispatch, '`dispatch` is required in Preload. Add connect() the component and ensure dispatch is available.');

      this.newProps = { dispatch, rest };
      this.state = { loading: true, pastDelay: false };

      this.clearTimeouts = this.clearTimeouts.bind(this);
    }

    componentDidMount() {
      this._delay = setTimeout(() => {
        this.setState((prevState) => ({
          ...prevState,
          pastDelay: true,
        }), () => {
        });
      }, delay);

      method.call(null, this.newProps.dispatch, this.newProps.rest)
        .then(() => {
          this.setState((prevState) => ({
            ...prevState,
            loading: false,
            pastDelay: true,
          }));
          this.clearTimeouts();
        })
        .catch((errorResponse) => {
          this.setState((prevState) => ({
            ...prevState,
            error: errorResponse,
            loading: false,
            pastDelay: true,
          }));
          this.clearTimeouts();
        });
    }

    clearTimeouts() {
      clearTimeout(this._delay);
    }

    componentWillUnmount() {
      this.clearTimeouts();
    }

    render() {
      const { loading, error, pastDelay } = this.state;
      if (loading || error) {
        return (
          <LoadingComponent
            isLoading={loading}
            error={error}
            pastDelay={pastDelay}
          />
        );
      }
      return <Child {...this.props} />;
    }
  };
};


export const ComponentPreload = (method) =>
  Preload({ loader: ComponentLoader, delay: 200, method });

export const PagePreload = (method) =>
  Preload({ loader: PageLoader, delay: 200, method });

export default Preload;
