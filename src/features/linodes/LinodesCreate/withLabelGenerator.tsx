;import * as React from 'react';
import { deriveDefaultLabel, LabelArgTypes } from './deriveDefaultLabel';
// import { connect } from 'redux';

export interface LabelProps {
  customLabel: string;
  updateCustomLabel: (e: any) => void;
  getLabel: (...args: any[]) => string;
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

    getLabel = (...args: LabelArgTypes[]) => {
      const { hasUserTypedCustomLabel, customLabel } = this.state;

      // If a user has typed in the 'label' input field, don't derive a default label name
      if (hasUserTypedCustomLabel || !args) { return customLabel; }

      const defaultLabel = deriveDefaultLabel(...args);

      // In case the derived label doesn't match API requirements
      if (!testAPIRequirements(defaultLabel)) { return customLabel; }

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

const testAPIRequirements = (label: string) => {
  const linodeLabelRegExp = /^[a-zA-Z]((?!--|__)[a-zA-Z0-9-_])+$/;
  return linodeLabelRegExp.test(label);
}