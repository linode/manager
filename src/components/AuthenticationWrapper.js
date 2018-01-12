import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { v4 } from 'uuid';
import { stringify } from 'querystring';
import { APP_ROOT, LOGIN_ROOT } from '~/constants';
import { clientId } from '~/secrets';

const createOAuth = (path, clientId, scope = '*', responseType, redirectUri) => {
  const query = {
    client_id: clientId,
    scope,
    response_type: responseType,
    redirect_uri: redirectUri,
    ...(responseType === 'token') && { state: v4() },
  };

  return `${path}?${stringify(query)}`;
};

class AuthenticationWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChildren: false,
    };
  }

  componentWillMount() {
    const { isAuthenticated, location: { pathname }, redirectToLogin } = this.props;

    if (this.isExcludedRoute(pathname) || isAuthenticated) {
      this.setState((prevState) => ({ ...prevState, showChildren: true }));
      return;
    }

    if (!isAuthenticated) {
      return redirectToLogin();
    }
  }

  isExcludedRoute = (pathname) => {
    const excludedPaths = ['/oauth/callback', '/logout'];
    return excludedPaths.reduce((result, current) => result || pathname.includes(current), false);
  }

  render() {
    const { children } = this.props;
    const { showChildren } = this.state;
    return (<div>{showChildren && children}</div>);
  }
}

AuthenticationWrapper.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  redirectToLogin: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node,
};

AuthenticationWrapper.defaultProps = {
  isAuthenticated: false,
};

const mapDispatchToProps = (state, ownProps) => ({
  redirectToLogin() {
    const { location: { pathname, search } } = ownProps;
    const returnURL = `${pathname}${search && `%3F${search}`}`;

    window.location = createOAuth(
      `${LOGIN_ROOT}/oauth/authorize`,
      clientId,
      '*',
      'code',
      `${encodeURIComponent(APP_ROOT)}/oauth/callback?${encodeURIComponent(returnURL)}` // TODO
    );
  },
});

const mapStateToProps = (state) => ({
  /**
   * Is this all we require to determine if someone is authenticated?
   */
  isAuthenticated: Boolean(state.authentication.token),
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(AuthenticationWrapper);
