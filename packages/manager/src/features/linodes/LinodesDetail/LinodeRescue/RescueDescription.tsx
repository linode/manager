import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useLinodeFirewalls } from 'src/queries/linodeFirewalls';

const rescueDescription = {
  text: `If you suspect that your primary filesystem is corrupt, use the Linode Manager to boot your Linode into Rescue Mode. This is a safe environment for performing many system recovery and disk management tasks.`,
  link: 'https://www.linode.com/docs/guides/rescue-and-rebuild/',
  firewallWarning:
    'Cloud Firewall rules are not enabled when booting into Rescue Mode.',
};

interface Props {
  linodeId: number;
  isBareMetal?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(1),
  },
  notice: {
    marginTop: theme.spacing(2),
  },
  lishLink: theme.applyLinkStyles,
}));

const RescueDescription: React.FC<Props> = (props) => {
  const { linodeId, isBareMetal } = props;
  const classes = useStyles();

  const { data: linodeFirewallsData } = useLinodeFirewalls(linodeId);
  const firewallsLinodeAssignedTo = linodeFirewallsData?.data ?? [];
  const displayFirewallWarning = firewallsLinodeAssignedTo.length > 0;

  return (
    <React.Fragment>
      {displayFirewallWarning ? (
        <Notice
          warning
          text={rescueDescription.firewallWarning}
          spacingTop={0}
          spacingBottom={16}
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
