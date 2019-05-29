import * as React from 'react';
import { perfume } from 'src/perfMetrics';

export interface Props {
  endPerfMeasurement: () => void;
}

/**
 * withPerfMetrics
 *
 * HOC that starts a performance metric reading in the constructor.
 * It provides a method, endPerfMeasurement(), to the child component,
 * which ends the reading and sends a GA event.
 *
 * Example usage:
 *
 * ```javascript
 * class MyComponent extends React.Component {
 *   ...
 *   componentDidMount() {
 *     someAsyncRequest().then(data => {
 *       this.props.endPerfMeasurement(); // <-- This ends the reading and sends a GA event
 *       this.setState({ data });
 *     })
 *   }
 *   ...
 * }
 *
 * export default withPerfMetrics('MyComponentLoaded')(MyComponent); // <-- 'MyComponentLoaded' is the metric name
 * ```
 *
 * endPerfMeasurement() can be called wherever makes most sense for the component.
 * It could be in CDM, CDU, React.useEffect, after an API request, etc.
 */
export default (signature: string) => (
  Component: React.ComponentType<Props>
) => {
  class WrappedComponent extends React.PureComponent<{}, {}> {
    constructor(props: any) {
      super(props);
      perfume.start(signature);
    }

    render() {
      return React.createElement(Component, {
        ...this.props,
        endPerfMeasurement: () => perfume.end(signature)
      });
    }
  }

  return WrappedComponent;
};
