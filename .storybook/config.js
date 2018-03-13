import { configure } from '@storybook/react';

import 'typeface-lato';
import '../src/index.css';
import '../.storybook/storybook.css';

// automatically import all files ending in *.stories.js
const req = require.context('../src/components', true, /.stories.tsx?$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
