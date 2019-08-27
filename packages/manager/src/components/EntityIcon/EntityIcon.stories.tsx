import { storiesOf } from '@storybook/react';
import * as React from 'react';
import EntityIcon from './EntityIcon';

storiesOf('Entity Icon', module).add('Icons', () => (
  <div style={{ padding: 20 }}>
    <div>
      <EntityIcon variant="nodebalancer" />
    </div>
    <div>
      <EntityIcon variant="linode" status="running" />
    </div>
    <div>
      <EntityIcon variant="linode" status="offline" />
    </div>
    <div>
      <EntityIcon variant="linode" status="loading" loading />
    </div>
    <div>
      <EntityIcon variant="domain" status="active" />
    </div>
    <div>
      <EntityIcon variant="domain" status="disabled" />
    </div>
  </div>
));
