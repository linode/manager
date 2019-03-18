import { Component } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { LOGIN_ROOT } from 'src/constants';
import { handleLogout } from 'src/store/authentication/authentication.actions';

export class Logout extends Component<DispatchProps> {
  componentDidMount() {
    this.props.dispatchLogout();

    /** send the user back to login */
    window.location.assign(`${LOGIN_ROOT}/logout`);
  }

  render() {
    return null;
  }
}

interface DispatchProps {
  dispatchLogout: () => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => {
  return {
    dispatchLogout: () => dispatch(handleLogout())
  };
};

const connected = connect(
  undefined,
  mapDispatchToProps
);

export default connected(Logout);
