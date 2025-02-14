import * as React from 'react';
import { connect } from 'react-redux';

import { CLIENT_ID } from 'src/constants';
import { clearUserInput } from 'src/store/authentication/authentication.helpers';
import { handleLogout } from 'src/store/authentication/authentication.requests';
import { getEnvLocalStorageOverrides } from 'src/utilities/storage';

import type { MapDispatchToProps, MapStateToProps } from 'react-redux';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { ApplicationState } from 'src/store';

interface LogoutProps extends DispatchProps, StateProps {}

export const Logout = ({ dispatchLogout, token }: LogoutProps) => {
  React.useEffect(() => {
    // Clear any user input (in the Support Drawer) since the user is manually logging out.
    clearUserInput();

    const localStorageOverrides = getEnvLocalStorageOverrides();

    const clientID = localStorageOverrides?.clientID ?? CLIENT_ID;

    // Split the token so we can get the token portion of the "<prefix> <token>" pair
    dispatchLogout(clientID || '', token.split(' ')[1]);
  }, [dispatchLogout, token]);

  return null;
};

interface StateProps {
  token: string;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (
  state,
  ownProps
) => ({
  token: state?.authentication?.token ?? '',
});

interface DispatchProps {
  dispatchLogout: (client_id: string, token: string) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => {
  return {
    dispatchLogout: (client_id: string, token: string) =>
      dispatch(handleLogout({ client_id, token })),
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(Logout);
