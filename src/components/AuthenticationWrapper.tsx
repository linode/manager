import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { redirectToLogin } from 'src/session';

interface Props {
  isAuthenticated: boolean;
  loginRedirect: Function;
  location: {
    pathname: string,
    search: string,
  };
  history: {
    push: Function,
  };
}

export class AuthenticationWrapper extends React.Component<Props> {
  state = {
    showChildren: false,
  };

  static defaultProps = {
    isAuthenticated: false,
  };

  componentWillMount() {
    const { isAuthenticated, location: { pathname }, loginRedirect } = this.props;

    if (this.isExcludedRoute(pathname) || isAuthenticated) {
      this.setState({ showChildren: true });
      return;
    }

    if (!isAuthenticated) {
      return loginRedirect();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { isAuthenticated, location: { pathname }, loginRedirect } = nextProps;
    if (!isAuthenticated && !this.isExcludedRoute(pathname)) {
      return loginRedirect();
    }
  }

  isExcludedRoute = (pathname: string) => {
    const excludedPaths = ['/oauth/callback', '/logout'];
    return excludedPaths.reduce((result, current) => result || pathname.includes(current), false);
  }

  render() {
    const { children } = this.props;
    const { showChildren } = this.state;
    return (
      <React.Fragment>
        {showChildren && children}
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (state: Linode.AppState, ownProps: Props) => ({
  loginRedirect() {
    const { location: { pathname: path, search: querystring } } = ownProps;
    redirectToLogin(path, querystring);
  },
});

const mapStateToProps = (state: Linode.AppState) => ({
  isAuthenticated: Boolean(state.authentication.token),
});

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps as Linode.TodoAny),
)(AuthenticationWrapper);
