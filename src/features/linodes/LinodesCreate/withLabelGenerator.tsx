import * as React from 'react';
import { connect } from 'react-redux';
import { deriveDefaultLabel, LabelArgTypes } from './deriveDefaultLabel';

export interface LabelProps {
  customLabel: string;
  updateCustomLabel: (e: any) => void;
  getLabel: (...args: any[]) => string;}


export interface LabelState {
  customLabel: string;
  hasUserTypedCustomLabel: boolean;
}

export const WithLabelGenerator = (Component: React.ComponentType<any>) => {
  class WrappedComponent extends React.PureComponent<any, LabelState> {
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

      const dedupedLabel = dedupeLabel(defaultLabel, this.props.linodeLabels);

      // In case the derived label doesn't match API requirements
      if (!testAPIRequirements(dedupedLabel)) { return customLabel; }

      return dedupedLabel;
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
  return connected(WrappedComponent);
}

const connected = connect((state: ApplicationState) => ({
  linodeLabels: state.__resources.linodes.entities.map(l => l.label)
}));

const testAPIRequirements = (label: string) => {
  const linodeLabelRegExp = /^[a-zA-Z]((?!--|__)[a-zA-Z0-9-_])+$/;
  return linodeLabelRegExp.test(label) && label.length <= 32;
}

export default WithLabelGenerator;


// Utilities
export const dedupeLabel = (label: string, existingLabels: string[]): string => {
  const ZERO_PAD_WIDTH = 3;

  let dedupedLabel = label;
  let i = 1;

  const matchingLabels = existingLabels.filter(l => l.startsWith(label));

  while (matchingLabels.find(l => l === dedupedLabel)) {
    dedupedLabel = label + pad(i, ZERO_PAD_WIDTH);
    i++;
  }
  return dedupedLabel;
}

export const pad = (n: number, width: number, padChar = '0'): string => {
  const s = n + '';
  return s.length >= width ? s : new Array(width - s.length + 1).join(padChar) + s;
}