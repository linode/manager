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
  'ecumenical council number two',
];

export default {
  title: 'Debounced Search',
};

export const TextField = () => <TextFieldExample list={list} />;
export const SelectField = () => <SelectExample list={list} />;
