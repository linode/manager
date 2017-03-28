import React, { PropTypes } from 'react';

import { Button } from '~/components/buttons';


export function launchWeblishConsole(linode) {
  window.open(
    `${window.location.protocol}//${window.location.host}/linodes/${linode.label}/weblish`,
    `weblish_con_${linode.id}`,
    'left=100,top=100,width=1024,height=655,toolbar=0,resizable=1'
  );
}

export default function WeblishLaunch(props) {
  const { linode } = props;

  return (
    <Button onClick={() => { launchWeblishConsole(linode); }}>
      Open
    </Button>
  );
}

WeblishLaunch.propTypes = {
  linode: PropTypes.object.isRequired,
};
