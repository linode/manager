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
      // cast of this.props to any needed because of
      // https://github.com/Microsoft/TypeScript/issues/17281
      const { updateFor, ...rest } = this.props as any;
      return (
        <Component {...rest} />
      );
    }
  };
}
