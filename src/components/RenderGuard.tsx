import { equals } from 'ramda';
import * as React from 'react';

import { withTheme, WithTheme } from '@material-ui/core/styles';

interface RenderGuardProps {
  updateFor?: any[];
}

/* tslint:disable-next-line */
const renderGuard = <P extends {}>(Component: React.ComponentType<P & RenderGuardProps>) => {
  type EnhancedProps = P & RenderGuardProps & WithTheme;

  class ComponentWithRenderGuard extends React.Component<EnhancedProps> {
    static displayName = `WithRenderGuard(${getDisplayName(Component)})`;

    shouldComponentUpdate(nextProps: EnhancedProps) {
      if (Array.isArray(this.props.updateFor)) {
        // don't update if the values of the updateFor Array are equal
        // this is a deep comparison
        return !equals(this.props.updateFor, nextProps.updateFor)
          || this.props.theme.name !== nextProps.theme.name;
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

  return themed<EnhancedProps>(ComponentWithRenderGuard) as React.ComponentType<P & RenderGuardProps>;
}

const themed = withTheme();

const getDisplayName = (Component: React.ComponentType) =>
  Component.displayName || Component.name || 'Component';

export default renderGuard;
