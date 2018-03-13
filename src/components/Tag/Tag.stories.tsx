import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Tag from './Tag';

storiesOf('Tags', module)
  .add('primary', () => (
    <Tag label="tag" />
  ))
  .add('light', () => (
    <Tag label="tag" variant="light" />
  ))
  .add('gray', () => (
    <Tag label="tag" variant="gray" />
  ))
  .add('lightGray', () => (
    <Tag label="tag" variant="lightGray" />
  ))
  .add('blue', () => (
    <Tag label="tag" variant="blue" />
  ))
  .add('lightBlue', () => (
    <Tag label="tag" variant="lightBlue" />
  ))
  .add('green', () => (
    <Tag label="tag" variant="green" />
  ))
  .add('lightGreen', () => (
    <Tag label="tag" variant="lightGreen" />
  ))
  .add('yellow', () => (
    <Tag label="tag" variant="yellow" />
  ))
  .add('lightYellow', () => (
    <Tag label="tag" variant="lightYellow" />
  ))
  .add('white', () => (
    <Tag label="tag" variant="white" />
  ))
  .add('editable', () => (
    <Tag label="tag" onDelete={action('click')} />
  ));
