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

  componentDidMount() {
    const { initSession } = this.props;
    /**
     * set redux state to what's in local storage
     * or expire the tokens if the expiry time is in the past
     *
     * if nothing exist in local storage, we get shot off to login
     */
    initSession();

    /**
     * this is the case where we've just come back from login and need
     * to show the children onMount
     */
    if (this.props.isAuthenticated) {
      this.setState({ showChildren: true });
    }
  }

  /**
   * handles for the case where we've refreshed the page
   * and redux has now been synced with what is in local storage
   */
  componentDidUpdate(prevProps: CombinedProps) {
    /** if we were previously not authed and now we are authed */
    if (!prevProps.isAuthenticated && this.props.isAuthenticated) {
      return this.setState({ showChildren: true });
    }

    /** basically handles for the case where our token is expired or we got a 401 error */
    if (prevProps.isAuthenticated && !this.props.isAuthenticated) {
      redirectToLogin(location.pathname, location.search);
    }
  }

  render() {
    const { children } = this.props;
    const { showChildren } = this.state;
    return <React.Fragment>{showChildren ? children : null}</React.Fragment>;
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
  initSession: () => dispatch(handleInitTokens())
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default connected(AuthenticationWrapper);
