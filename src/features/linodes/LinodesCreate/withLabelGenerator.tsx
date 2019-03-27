import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { deriveDefaultLabel, LabelArgTypes } from './deriveDefaultLabel';

export interface LabelProps {
  customLabel: string;
  updateCustomLabel: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  getLabel: (...args: any[]) => string;
}

export interface LabelState {
  customLabel: string;
  hasUserTypedCustomLabel: boolean;
}

// This HOC gives a component the ability to:
//  1) Derive a default label name based on given params, e.g. props.getLabel('image-name', 'region-name')
//  2) Keep track of custom input state. If a user has typed into an input field, we don't want to derive label
//     names anymore, even if additional selections are made, because once they've touched the label input field,
//     they may have given it a custom name, which we don't want to erase.
//
export const withLabelGenerator = (Component: React.ComponentType<any>) => {
  class WrappedComponent extends React.PureComponent<any, LabelState> {
    state: LabelState = {
      customLabel: '',
      hasUserTypedCustomLabel: false
    };

    updateCustomLabel = (e: any) => {
      this.setState({
        customLabel: e.target.value,
        hasUserTypedCustomLabel: true
      });
    };

    getLabel = (...args: LabelArgTypes[]) => {
      const { hasUserTypedCustomLabel, customLabel } = this.state;

      // If a user has typed in the 'label' input field, don't derive a default label name
      if (hasUserTypedCustomLabel || !args) {
        return customLabel;
      }

      const defaultLabel = deriveDefaultLabel(...args);

      const dedupedLabel = dedupeLabel(defaultLabel, this.props.linodeLabels);

      // Final failsafe: in case the derived label doesn't match API requirements
      if (!testAPIRequirements(dedupedLabel)) {
        return customLabel;
      }

      return dedupedLabel;
    };

    render() {
      return React.createElement(Component, {
        updateCustomLabel: this.updateCustomLabel,
        getLabel: this.getLabel,
        ...this.props,
        ...this.state
      });
    }
  }
  return connected(WrappedComponent);
};

// Connect to Redux state, so that we have access to existing Linode Labels (we may need to dedupe).
const connected = connect((state: ApplicationState) => ({
  linodeLabels: state.__resources.linodes.entities.map(l => l.label)
}));

// Regex taken from API documentation.
const testAPIRequirements = (label: string) => {
  // NOTE: This regex is incorrect. We need to replace it with one that is consistent with API requirements.
  // const linodeLabelRegExp = /^[a-zA-Z]((?!--|__)[a-zA-Z0-9-_])+$/;
  // return linodeLabelRegExp.test(label) && label.length <= 32;

  return label.length <= 32;
};

export default withLabelGenerator;

// Utilities

// Searches 'existingLabels' and appends a zero-padded increment-er to the original label
export const dedupeLabel = (
  label: string,
  existingLabels: string[]
): string => {
  const ZERO_PAD_WIDTH = 3;

  let dedupedLabel = label;
  let i = 1;

  const matchingLabels = existingLabels.filter(l => l.startsWith(label));

  while (matchingLabels.find(l => l === dedupedLabel)) {
    dedupedLabel = label + '-' + i.toString().padStart(ZERO_PAD_WIDTH, '0');
    i++;

    // EDGE CASE: if a user has 999 iterations of the same name (arch-us-east-001, arch-us-east-002, ...)
    // just return the original label. They'll get an API error.
    if (i === 999) {
      return label;
    }
  }
  return dedupedLabel;
};
