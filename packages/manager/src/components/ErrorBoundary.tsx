import React from 'react';
import { reportException } from 'src/exceptionReporting';

interface Props {
  fallback: React.ReactElement;
  callback?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.props.callback) {
      this.props.callback(error, errorInfo);
    }

    reportException(error, {
      message: `Captured in ErrorBoundary.tsx: ${errorInfo}`,
    });
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
