import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { redirectToLogin } from 'src/session';
import { MapState } from 'src/store/types';

interface Props {
  location: {
    pathname: string;
    search: string;
  };
  history: {
    push: Function;
  };
}

type CombinedProps = Props & StateProps & DispatchProps;

export class AuthenticationWrapper extends React.Component<CombinedProps> {
  state = {
    showChildren: false
  };

  static defaultProps = {
    isAuthenticated: false
  };

  componentWillMount() {
    const {
      isAuthenticated,
      location: { pathname },
      actions
    } = this.props;

    if (this.isExcludedRoute(pathname) || isAuthenticated) {
      this.setState({ showChildren: true });
      return;
    }

    if (!isAuthenticated) {
      return actions.loginRedirect();
    }
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
    const {
      isAuthenticated,
      location: { pathname },
      actions
    } = nextProps;
    if (!isAuthenticated && !this.isExcludedRoute(pathname)) {
      return actions.loginRedirect();
    }
  }

  isExcludedRoute = (pathname: string) => {
    const excludedPaths = ['/oauth/callback', '/logout'];
    return excludedPaths.reduce(
      (result, current) => result || pathname.includes(current),
      false
    );
  };

  render() {
    const { children } = this.props;
    const { showChildren } = this.state;
    return <React.Fragment>{showChildren && children}</React.Fragment>;
  }
}

interface StateProps {
  isAuthenticated: boolean;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  isAuthenticated: Boolean(state.authentication.token)
});

interface DispatchProps {
  actions: {
    loginRedirect: () => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch,
  ownProps
) => ({
  actions: {
    loginRedirect: () => {
      const {
        location: { pathname: path, search: querystring }
      } = ownProps;
      redirectToLogin(path, querystring);
    }
  }
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  withRouter,
  connected
)(AuthenticationWrapper);
