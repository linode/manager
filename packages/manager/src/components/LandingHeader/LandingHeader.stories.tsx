import { storiesOf } from '@storybook/react';
import * as React from 'react';
import LandingHeader from './LandingHeader';

storiesOf('EntityLandingHeader', module).add('default', () => (
  <div style={{ padding: '12px' }}>
    <LandingHeader
      title="Linode"
      onAddNew={() => null}
      iconType="linode"
      docsLink="https://linode.com/docs"
    />
  </div>
));
