import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Typography from 'material-ui/Typography';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ShowMoreExpansion from './ShowMoreExpansion';

storiesOf('ShowMoreExpansion', module)
.addDecorator(ThemeDecorator)
.add('default', () => (
  <ShowMoreExpansion name="Show Older Images">
    <Typography>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore et dolore magna aliqua.
      Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
      Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident,
      sunt in culpa qui officia deserunt mollit anim id est laborum.
    </Typography>
  </ShowMoreExpansion>
));
