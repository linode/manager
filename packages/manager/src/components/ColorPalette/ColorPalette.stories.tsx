import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ColorPalette from './ColorPalette';

storiesOf('Color Palette', module).add('Default', () => <ColorPalette />);

storiesOf('Color Palette', module).add('Background', () => (
  <ColorPalette displayBackgrounds />
));
