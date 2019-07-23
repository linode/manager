import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Tags from './Tags';

storiesOf('Tags', module)
  .add('Tags list without show more', () => {
    return (
      <Tags tags={['tagOne', 'tagTwo', 'someStrangeLongTagWithNumber123']} />
    );
  })
  .add('Tags list with show more', () => {
    return (
      <Tags
        tags={[
          'tagOne',
          'tagTwo',
          'someStrangeLongTagWithNumber123',
          'Tag1',
          'Tag2'
        ]}
      />
    );
  });
