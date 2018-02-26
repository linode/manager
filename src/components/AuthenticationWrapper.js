import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { redirectToLogin } from '~/session';

export class AuthenticationWrapper extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChildren: false,
    };
  }

  componentWillMount() {
    const { isAuthenticated, location: { pathname }, loginRedirect } = this.props;

    if (this.isExcludedRoute(pathname) || isAuthenticated) {
      this.setState((prevState) => ({ ...prevState, showChildren: true }));
      return;
    }

    if (!isAuthenticated) {
      return loginRedirect();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { isAuthenticated, location: { pathname }, loginRedirect } = nextProps;
    if (!isAuthenticated && !this.isExcludedRoute(pathname)) {
      return loginRedirect();
    }
  }

  isExcludedRoute = (pathname) => {
    const excludedPaths = ['/oauth/callback', '/logout'];
    return excludedPaths.reduce((result, current) => result || pathname.includes(current), false);
  }

  render() {
    const { children } = this.props;
    const { showChildren } = this.state;
    return (<Fragment>{showChildren && children}</Fragment>);
  }
}

AuthenticationWrapper.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  loginRedirect: PropTypes.func.isRequired,
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
  loginRedirect() {
    const { location: { pathname: path, search: querystring } } = ownProps;
    redirectToLogin(path, querystring);
  },
});

const mapStateToProps = (state) => ({
  isAuthenticated: Boolean(state.authentication.token),
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(AuthenticationWrapper);
