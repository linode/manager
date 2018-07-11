import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Tag from './Tag';

storiesOf('Tags', module)
  .addDecorator(ThemeDecorator)
  .add('primary', () => (
    <Tag label="tag" />
  ))
  .add('white', () => (
    <Tag label="tag" variant="white" />
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
  .add('editable', () => (
    <Tag label="delete-tag" onDelete={action('click')} />
  ));
