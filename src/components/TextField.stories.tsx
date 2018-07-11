import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../utilities/storybookDecorators';
import TextField from './TextField';

storiesOf('TextField', module)
.addDecorator(ThemeDecorator)
.add('Normal', () => (
  <TextField
    label="Input Label"
    placeholder="Normal State"
  >
    Normal State
  </TextField>
))
.add('Active', () => (
  <TextField
    label="Input Label"
    placeholder="Active State"
    autoFocus
  >
    Active State
  </TextField>
))
.add('Error', () => (
  <TextField
    label="Input Label"
    placeholder="Error State"
    errorText="This input needs further attention"
  >
    Error State
  </TextField>
))
.add('Affirmative', () => (
  <TextField
    label="Input Label"
    placeholder="Affirmative State"
    affirmative
  >
    Affirmative State
  </TextField>
))
.add('Disabled', () => (
  <TextField
    label="Input Label"
    placeholder="Disabled State"
    disabled
  >
    Disabled State
  </TextField>
))
;
