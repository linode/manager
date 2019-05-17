import { storiesOf } from '@storybook/react';
import * as React from 'react';
import List from 'src/components/core/List';
import EventListItem from './EventListItem';

const testContent =
  "We hope you're doing well! We're sending you this update " +
  "because you're participating in our Block Storage beta and we would like to " +
  "know more about how you're using the service.";

storiesOf('EventListItem', module).add('All EventListItems', () => (
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
