import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ColorPalette from './ColorPalette_CMR';

storiesOf('CMR Color Palette', module).add('Default', () => <ColorPalette />);

storiesOf('CMR Color Palette', module).add('Background', () => (
  <ColorPalette displayBackgrounds />
));
