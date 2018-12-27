import * as React from 'react';
import { deriveDefaultLabel, LabelOptions } from './deriveDefaultLabel';
// import { connect } from 'redux';

export interface LabelProps {
  customLabel: string;
  updateCustomLabel: (e: any) => void;
  getLabel: (args?: Partial<LabelOptions>) => string;
}

export interface LabelState {
  customLabel: string;
  hasUserTypedCustomLabel: boolean;
}

// @todo: do we actually need options?
export const WithLabelGenerator = (options: any /* @todo: type */) => (Component: React.ComponentType<any>) => {
  class WrappedComponent extends React.PureComponent<{}, LabelState> {
    state: LabelState = {
      customLabel: '',
      hasUserTypedCustomLabel: false
    }

    updateCustomLabel = (e: any) => {
      this.setState({ customLabel: e.target.value, hasUserTypedCustomLabel: true });
    }

    getLabel = (args?: Partial<LabelOptions>) => {
      const { hasUserTypedCustomLabel, customLabel } = this.state;

      // If a user has typed in the 'label' input field, don't derive a default label name
      if (hasUserTypedCustomLabel || !args) { return customLabel; }

      const defaultLabel = deriveDefaultLabel(args);

      // TODO: add increment logic here

      return defaultLabel;
    }

    render() {
      return React.createElement(Component, {
        updateCustomLabel: this.updateCustomLabel,
        getLabel: this.getLabel,
        ...this.props,
        ...this.state
      })
    }
  }
  return WrappedComponent;
}

// @todo: will need to connect to redux to check for existing labels (will increment if there are existing)
export default WithLabelGenerator;