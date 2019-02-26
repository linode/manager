import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { redirectToLogin } from 'src/session';
import { handleInitTokens } from 'src/store/authentication/authentication.actions';
import { MapState } from 'src/store/types';

type CombinedProps = DispatchProps & StateProps;

export class AuthenticationWrapper extends React.Component<CombinedProps> {
  state = {
    showChildren: false
  };

  static defaultProps = {
    isAuthenticated: false
  };

  componentWillMount() {
    const { isAuthenticated } = this.props;

    if (isAuthenticated || this.isExcludedRoute(location.pathname)) {
      return this.setState({ showChildren: true });
    } else {
      return redirectToLogin(location.pathname, location.search);
    }
  }

  componentDidMount() {
    /**
     * set redux state to what's in local storage
     * or expire the tokens if the expiry time is in the past
     */
    this.props.initSession();
  }

  shouldComponentUpdate(nextProps: CombinedProps) {
    /** if we're not authed and not on a whitelisted route */
    if (
      !nextProps.isAuthenticated &&
      !this.isExcludedRoute(location.pathname)
    ) {
      redirectToLogin(location.pathname, location.search);
    }

    return true;
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

const mapStateToProps: MapState<StateProps, {}> = state => ({
  isAuthenticated: Boolean(state.authentication.token)
});

interface DispatchProps {
  initSession: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  initSession: () => dispatch(handleInitTokens)
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default connected(AuthenticationWrapper);
