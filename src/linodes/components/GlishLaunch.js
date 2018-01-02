import PropTypes from 'prop-types';
import React from 'react';

import { Button } from 'linode-components';


export function launchGlishConsole(linode) {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linode.label}/glish`,
    `glish_con_${linode.id}`,
    'left=100,top=100,width=1024,height=600,toolbar=0,resizable=1'
  );
}

export default function GlishLaunch(props) {
  const { linode } = props;

  return (
    <Button onClick={() => { launchGlishConsole(linode); }}>
      Open
    </Button>
  );
}

GlishLaunch.propTypes = {
  linode: PropTypes.object.isRequired,
};
