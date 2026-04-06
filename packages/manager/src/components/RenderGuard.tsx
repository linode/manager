import { getDisplayName } from '@linode/utilities';
import { equals } from 'ramda';
import * as React from 'react';

export interface RenderGuardProps {
  updateFor?: any[];
}

/* tslint:disable-next-line */
export const RenderGuard = <P extends {}>(
  Component: React.ComponentType<P & RenderGuardProps>
) => {
  class ComponentWithRenderGuard extends React.Component<P & RenderGuardProps> {
    static displayName = `WithRenderGuard(${getDisplayName(Component)})`;

    render() {
      // cast of this.props to any needed because of
      // https://github.com/Microsoft/TypeScript/issues/17281
      //
      // Destructure out "theme" so it's not passed to the component.
      // This fixes the "<div theme=[object Object] />" issue.
      const { theme, updateFor, ...rest } = this.props as any;
      return <Component {...rest} />;
    }

    shouldComponentUpdate(nextProps: P & RenderGuardProps) {
      if (Array.isArray(this.props.updateFor)) {
        // don't update if the values of the updateFor Array are equal
        // this is a deep comparison
        return !equals(this.props.updateFor, nextProps.updateFor);
      }
      // if updateFor isn't provided, always update (this is React's default behavior)
      return true;
    }
  }

  return ComponentWithRenderGuard as React.ComponentType<P & RenderGuardProps>;
};
