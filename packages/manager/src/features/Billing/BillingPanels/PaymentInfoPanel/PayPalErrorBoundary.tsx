import * as React from 'react';

import { reportException } from 'src/exceptionReporting';

import type { JSX } from "react";

interface State {
  error: boolean;
}

interface Props {
  children: React.ReactNode;
  renderError: (errorMsg: string) => JSX.Element;
}

export class PayPalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: false };
  }

  static getDerivedStateFromError(error: unknown) {
    reportException('Error occured when initializing PayPal with Braintree', {
      error,
    });
    return { error: true };
  }

  render() {
    const { error } = this.state;

    if (error) {
      return this.props.renderError('Error initializing PayPal.');
    }

    return this.props.children;
  }
}
