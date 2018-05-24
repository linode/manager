import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import AccountNotifications from './AccountNotifications';

class AccountNotificationsStory extends React.Component {
  state = {
    active: false,
  };

  handleClick = () => {
    this.setState({ active: true });
  }

  render() {
    return (
      <React.Fragment>
        <AccountNotifications />
      </React.Fragment>
    );
  }
}

storiesOf('Account Nodifications', module)
.addDecorator(ThemeDecorator)
.add('Account Notifications', () => (
  <AccountNotificationsStory />
))
;
