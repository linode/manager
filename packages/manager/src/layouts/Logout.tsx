import { pathOr } from 'ramda';
import { Component } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { CLIENT_ID } from 'src/constants';
import { ApplicationState } from 'src/store';
import { handleLogout } from 'src/store/authentication/authentication.requests';

export class Logout extends Component<DispatchProps & StateProps> {
  componentDidMount() {
    // Split the token so we can get the token portion of the "<prefix> <token>" pair
    this.props.dispatchLogout(CLIENT_ID || '', this.props.token.split(' ')[1]);
  }

  render() {
    return null;
  }
}

interface StateProps {
  token: string;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (
  state,
  ownProps
) => ({
  token: pathOr('', ['authentication', 'token'], state)
});

interface DispatchProps {
  dispatchLogout: (client_id: string, token: string) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => {
  return {
    dispatchLogout: (client_id: string, token: string) =>
      dispatch(handleLogout({ client_id, token }))
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default connected(Logout);
