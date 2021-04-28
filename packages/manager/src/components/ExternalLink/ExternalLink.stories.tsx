import * as React from 'react';
import ExternalLink from './';

export default {
  title: 'External Link',
};

export const Default = () => (
  <div style={{ padding: 20 }}>
    <ExternalLink link="http://linode.com" text="Here is a link to the Linode website" />
  </div>
);

Default.story = {
  name: 'default',
};
