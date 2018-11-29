import { addDecorator, configure } from '@storybook/react';
import '../.storybook/storybook.css';
import '../public/fonts/fonts.css';
import '../src/index.css';
import ThemeDecorator from '../src/utilities/storybookDecorators';

/** Global decorators */
addDecorator(ThemeDecorator);

// automatically import all files ending in *.stories.js
const req = require.context('../src/components', true, /.stories.tsx?$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
