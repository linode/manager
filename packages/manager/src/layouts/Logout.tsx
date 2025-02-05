import { Component } from 'react';

import { clearUserInput } from 'src/store/authentication/authentication.helpers';

import { clearStorageAndRedirectToLogout } from './OAuth';

export class Logout extends Component<{}> {
  componentDidMount() {
    // Clear any user input (in the Support Drawer) since the user is manually logging out.
    clearUserInput();
    clearStorageAndRedirectToLogout();
  }

  render() {
    return null;
  }
}

export default Logout;
