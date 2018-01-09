import { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import { v4 } from 'uuid';
import { stringify } from 'querystring';
import { APP_ROOT, LOGIN_ROOT } from '~/constants';
import { clientId } from '~/secrets';

const createAuthOURL = (path, clientId, scope = '*', responseType, redirectUri) => {
  const query = {
    client_id: clientId,
    scope,
    response_type: responseType,
    redirect_uri: redirectUri,
    ...(responseType === 'token') && { state: v4() },
  };

  return `${path}?${stringify(query)}`;
};

const isAuthenticated = (WrappedComponent) => {
  class AuthenticatedComponent extends Component {
    componentWillMount() {
      const {
        isAuthenticated,
        location: { pathname },
        redirectToLogin,
      } = this.props;
      if (!isAuthenticated && !this.isExcludedRoute(pathname)) {
        return redirectToLogin();
      }
    }

    isExcludedRoute = (pathname) => {
      const excludedPaths = ['/oauth/callback', '/logout'];
      return excludedPaths.reduce((result, current) => result || pathname.includes(current), false);
    }

    render() {
      const { isAuthenticated, ...rest } = this.props; // eslint-disable-line no-unused-vars
      if (isAuthenticated) {
        return createElement(WrappedComponent, rest);
      }

      return null;
    }
  }

  AuthenticatedComponent.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    redirectToLogin: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  AuthenticatedComponent.defaultProps = {
    isAuthenticated: false,
  };

  const mapDispatchToProps = (state, ownProps) => ({
    redirectToLogin() {
      const { location: { pathname, search } } = ownProps;
      const returnURL = `${pathname}${search && `%3F${search}`}`;

      window.location = createAuthOURL(
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

  return compose(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
  )(AuthenticatedComponent);
};

export default isAuthenticated;
