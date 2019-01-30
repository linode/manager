import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface State {
  rendering: boolean;
  [name: string]: any;
}

type ReloadIf<R> = (
  routePropsOld: RouteComponentProps<R>,
  routePropsNew: RouteComponentProps<R>
) => boolean;

/* tslint:disable */
export default function reloadableWithRouter<P, R>(reloadIf: ReloadIf<R>) {
  return function(Component: React.ComponentType<P & RouteComponentProps<R>>) {
    /* tslint:enable */
    class ReloadableComponent extends React.Component<
      P & RouteComponentProps<R>,
      State
    > {
      state = { rendering: true };

      componentDidUpdate(prevProps: P & RouteComponentProps<R>) {
        const routePropsOld = {
          match: prevProps.match,
          location: prevProps.location,
          history: prevProps.history,
          staticContext: prevProps.staticContext
        };

        const routePropsNew = {
          match: this.props.match,
          location: this.props.location,
          history: this.props.history,
          staticContext: this.props.staticContext
        };

        /* The reloadIf function provided as an argument to this HOC takes two arguments, the
           previous route props and the new route props. If it returns true, then the component is
           reloaded */
        if (reloadIf(routePropsOld, routePropsNew)) {
          this.setState({ rendering: false }, () => {
            this.setState({ rendering: true });
          });
        }
      }

      render() {
        const { rendering } = this.state;
        if (rendering) {
          return <Component {...this.props} />;
        }
        return null;
      }
    }

    return withRouter(ReloadableComponent);
  };
}
