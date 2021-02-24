import { storiesOf } from '@storybook/react';
import * as React from 'react';
import DocumentationButton from './DocumentationButton';

storiesOf('Documentation Button', module).add('Default', () => (
  <div style={{ padding: 20, width: 104 }}>
    <DocumentationButton href="" />
  </div>
));
