import * as React from 'react';
import { storiesOf } from '@storybook/react';

import Typography from 'material-ui/Typography';

import ThemeDecorator from '../../utilities/storybookDecorators';
import ExpandPanel from './ExpandPanel';

storiesOf('Expand Panel', module)
.addDecorator(ThemeDecorator)
.add('default', () => (
  <ExpandPanel name="Show Older Images">
    <Typography variant="display1">
      ExpandPanel Content
    </Typography>
  </ExpandPanel>
));
