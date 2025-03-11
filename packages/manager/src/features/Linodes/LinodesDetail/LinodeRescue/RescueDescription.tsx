import { Notice, StyledLinkButton, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useLinodeFirewallsQuery } from '@linode/queries';

const rescueDescription = {
  firewallWarning:
    'Cloud Firewall rules are not enabled when booting into Rescue Mode.',
  link: 'https://techdocs.akamai.com/cloud-computing/docs/rescue-and-rebuild',
  text: `If you suspect that your primary filesystem is corrupt, use the Linode Manager to boot your Linode into Rescue Mode. This is a safe environment for performing many system recovery and disk management tasks.`,
};

interface Props {
  isBareMetal?: boolean;
  linodeId: number;
}

export const RescueDescription = (props: Props) => {
  const { isBareMetal, linodeId } = props;
  const theme = useTheme();

  const { data: linodeFirewallsData } = useLinodeFirewallsQuery(linodeId);
  const firewallsLinodeAssignedTo = linodeFirewallsData?.data ?? [];
  const displayFirewallWarning = firewallsLinodeAssignedTo.length > 0;

  return (
    <React.Fragment>
      {displayFirewallWarning ? (
        <Notice
          spacingBottom={16}
          spacingTop={0}
          text={rescueDescription.firewallWarning}
          variant="warning"
        />
      ) : null}
      <Typography>
        {rescueDescription.text}{' '}
        <Link to={rescueDescription.link}>Learn more.</Link>
      </Typography>
      {linodeId && isBareMetal ? (
        <Typography sx={{ marginTop: theme.spacing(1) }}>
          {`When your Linode has successfully rebooted into Rescue Mode, use the `}
          <StyledLinkButton onClick={() => lishLaunch(linodeId)}>
            LISH Console
          </StyledLinkButton>
          {` to access it.`}
        </Typography>
      ) : null}
    </React.Fragment>
  );
};
