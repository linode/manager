import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { useLinodeFirewalls } from 'src/queries/linodeFirewalls';

const rescueDescription = {
  text: `The rescue mode is only for emergency purposes, for example in case of a system or access failure. This will shut down your instance and mount the root disk to a temporary server. Then, you will be able to connect to this server, repair the system configuration or recover your data.`,
  link: 'https://docs.openstack.org/nova/latest/user/rescue.html',
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
