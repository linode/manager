// .storybook/preview.js
import React from 'react';
import { wrapWithTheme } from '../src/utilities/testHelpers';
export const decorators = [(Story) => wrapWithTheme(<Story />)];
