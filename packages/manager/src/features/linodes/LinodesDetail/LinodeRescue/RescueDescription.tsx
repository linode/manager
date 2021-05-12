import * as React from 'react';
import ExternalLink from 'src/components/ExternalLink';

const RESCUE_HELPER_TEXT = `If you suspect that your primary filesystem is corrupt, use the Linode
Manager to boot your Linode into Rescue Mode. This is a safe environment
for performing many system recovery and disk management tasks.`;

const RescueDescription = () => (
  <>
    {RESCUE_HELPER_TEXT}{' '}
    <ExternalLink
      fixedIcon
      text="Learn more."
      link="https://www.linode.com/docs/guides/rescue-and-rebuild/"
    />
  </>
);

export default RescueDescription;
