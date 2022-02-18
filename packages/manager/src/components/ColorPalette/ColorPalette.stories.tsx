import * as React from 'react';
import ColorPalette from './ColorPalette';
import ColorPalette_CMR from './ColorPalette_CMR';

export default {
  title: 'Core/ColorPalette',
};

export const Default = () => <ColorPalette />;

export const Background = () => <ColorPalette displayBackgrounds />;

export const CMR = () => <ColorPalette_CMR />;
