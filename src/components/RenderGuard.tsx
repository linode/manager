import * as React from 'react';
import { equals } from 'ramda';

interface Props {
  updateFor?: any[];
}

export default function renderGuard<P>(Component: React.ComponentType) {
  return class ComponentWithRenderGuard extends React.Component<Props & P> {
    shouldComponentUpdate(nextProps: Props & P) {
      if (Array.isArray(this.props.updateFor)) {
        // don't update if the values of the updateFor Array are equal
        // this is a deep comparison
        return !equals(this.props.updateFor, nextProps.updateFor);
      }
      // if updateFor isn't provided, always update (this is React's default behavior)
      return true;
    }

    render() {
      return (
        <Component {...this.props} />
      );
    }
  };
}
