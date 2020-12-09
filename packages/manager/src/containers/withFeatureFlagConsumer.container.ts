import { LDClient as _LDClient } from 'launchdarkly-js-client-sdk';
import * as React from 'react';
import { connect } from 'react-redux';
import { FlagSet } from 'src/featureFlags';
import { MockFeatureFlagState } from 'src/store/mockFeatureFlags';
import { MapState } from 'src/store/types';
import { compose } from 'recompose';
import { withLDConsumer } from 'launchdarkly-react-client-sdk';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';

/* eslint-disable-next-line */
export interface LDClient extends _LDClient {}

export interface FeatureFlagConsumerProps {
  flags: FlagSet;
  ldClient: LDClient;
}

// We have to provide an HOC around the `withLDConsumer` HOC in order to retrieve mock flags
// for the custom dev tools.
export const withFeatureFlagConsumer = (
  Component: React.ComponentType<any>
) => {
  class WrappedComponent extends React.Component<StateProps & LDProps> {
    render() {
      return React.createElement(Component, {
        ...this.props,
        flags: {
          // Real LD flags from `withLDConsumer()`.
          ...this.props.flags,
          // @todo: REMOVE BEFORE MERGE
          cmr: true,
          // Mock flags from Redux.
          ...this.props.mockFlags,

          // !!! Override the CMR flag so that it's officially "released" !!!!
          // @todo: clean up all conditional logic based on this flag.
          cmr: true
        }
      });
    }
  }

  const enhanced = compose(connected, withLDConsumer());

  return enhanced(WrappedComponent);
};

export default withFeatureFlagConsumer;

// Redux connection for the wrapped component.
interface StateProps {
  mockFlags: MockFeatureFlagState;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  mockFlags: state.mockFeatureFlags
});

const connected = connect(mapStateToProps);
