import { storiesOf } from '@storybook/react';
import * as React from 'react';
import SelectExample from './StoryComponents/SelectExample';
import TextFieldExample from './StoryComponents/TextFieldExample';

const list = [
  'apples',
  'oranges',
  'grapes',
  'walruses',
  'keyboards',
  'chairs',
  'speakers',
  'ecumenical council number two'
];

storiesOf('Debounced Search', module)
  .add('Text Field', () => <TextFieldExample list={list} />)
  .add('Select Field', () => <SelectExample list={list} />);
