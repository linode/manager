import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useLinodeFirewalls } from 'src/queries/linodes/firewalls';

const rescueDescription = {
  firewallWarning:
    'Cloud Firewall rules are not enabled when booting into Rescue Mode.',
  link: 'https://www.linode.com/docs/guides/rescue-and-rebuild/',
  text: `If you suspect that your primary filesystem is corrupt, use the Linode Manager to boot your Linode into Rescue Mode. This is a safe environment for performing many system recovery and disk management tasks.`,
};

interface Props {
  isBareMetal?: boolean;
  linodeId: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(1),
  },
  lishLink: theme.applyLinkStyles,
  notice: {
    marginTop: theme.spacing(2),
  },
}));

const RescueDescription: React.FC<Props> = (props) => {
  const { isBareMetal, linodeId } = props;
  const classes = useStyles();

  const { data: linodeFirewallsData } = useLinodeFirewalls(linodeId);
  const firewallsLinodeAssignedTo = linodeFirewallsData?.data ?? [];
  const displayFirewallWarning = firewallsLinodeAssignedTo.length > 0;

  return (
    <React.Fragment>
      {displayFirewallWarning ? (
        <Notice
          spacingBottom={16}
          spacingTop={0}
          text={rescueDescription.firewallWarning}
          warning
        />
      ) : null}
      <Typography>
        {rescueDescription.text}{' '}
        <Link to={rescueDescription.link}>Learn more.</Link>
      </Typography>
      {linodeId && isBareMetal ? (
        <Typography className={classes.copy}>
          {`When your Linode has successfully rebooted into Rescue Mode, use the `}
          <button
            className={classes.lishLink}
            onClick={() => lishLaunch(linodeId)}
          >
            LISH Console
          </button>
          {` to access it.`}
        </Typography>
      ) : null}
    </React.Fragment>
  );
};

export default RescueDescription;
