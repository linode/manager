import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { List } from '@material-ui/core';
import EventListItem from './EventListItem';

import ThemeDecorator from '../../utilities/storybookDecorators';

const testContent = 'We hope you\'re doing well! We\'re sending you this update ' +
  'because you\'re participating in our Block Storage beta and we would like to ' +
  'know more about how you\'re using the service.';

storiesOf('EventListItem', module)
.addDecorator(ThemeDecorator)
.add('All EventListItems', () => (
  <React.Fragment>
    <List disablePadding>
      <EventListItem
        title="Critical Maintainence required for FirstLinode"
        content={testContent}
      />
      <EventListItem
        success
        title="Critical Maintainence required for FirstLinode"
        content={testContent}
      />
      <EventListItem
        error
        title="Critical Maintainence required for FirstLinode"
        content={testContent}
      />
      <EventListItem
        warning
        title="Critical Maintainence required for FirstLinode"
        content={testContent}
      />
    </List>
  </React.Fragment>
));
