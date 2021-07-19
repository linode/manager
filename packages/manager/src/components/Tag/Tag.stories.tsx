import { action } from '@storybook/addon-actions';
import * as React from 'react';

import Tag from './Tag';

export default {
  title: 'UI Elements/Tags',
};

export const Primary = () => <Tag label="tag" />;

Primary.story = {
  name: 'primary',
};

export const White = () => <Tag label="tag" colorVariant="white" />;

White.story = {
  name: 'white',
};

export const Gray = () => <Tag label="tag" colorVariant="gray" />;

Gray.story = {
  name: 'gray',
};

export const LightGray = () => <Tag label="tag" colorVariant="lightGray" />;

LightGray.story = {
  name: 'lightGray',
};

export const Blue = () => <Tag label="tag" colorVariant="blue" />;

Blue.story = {
  name: 'blue',
};

export const LightBlue = () => <Tag label="tag" colorVariant="lightBlue" />;

LightBlue.story = {
  name: 'lightBlue',
};

export const Green = () => <Tag label="tag" colorVariant="green" />;

Green.story = {
  name: 'green',
};

export const LightGreen = () => <Tag label="tag" colorVariant="lightGreen" />;

LightGreen.story = {
  name: 'lightGreen',
};

export const Yellow = () => <Tag label="tag" colorVariant="yellow" />;

Yellow.story = {
  name: 'yellow',
};

export const LightYellow = () => <Tag label="tag" colorVariant="lightYellow" />;

LightYellow.story = {
  name: 'lightYellow',
};

export const Editable = () => (
  <Tag label="delete-tag" onDelete={action('click')} />
);

Editable.story = {
  name: 'editable',
};
