import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';

import Tag from './Tag';

storiesOf('Tags', module)
  .add('primary', () => <Tag label="tag" />)
  .add('white', () => <Tag label="tag" colorVariant="white" />)
  .add('gray', () => <Tag label="tag" colorVariant="gray" />)
  .add('lightGray', () => <Tag label="tag" colorVariant="lightGray" />)
  .add('blue', () => <Tag label="tag" colorVariant="blue" />)
  .add('lightBlue', () => <Tag label="tag" colorVariant="lightBlue" />)
  .add('green', () => <Tag label="tag" colorVariant="green" />)
  .add('lightGreen', () => <Tag label="tag" colorVariant="lightGreen" />)
  .add('yellow', () => <Tag label="tag" colorVariant="yellow" />)
  .add('lightYellow', () => <Tag label="tag" colorVariant="lightYellow" />)
  .add('editable', () => <Tag label="delete-tag" onDelete={action('click')} />);
