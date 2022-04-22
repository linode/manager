import { Volume } from '@linode/api-v4/lib/volumes';
import { DateTime } from 'luxon';
import * as React from 'react';
import Checkbox from 'src/components/CheckBox';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import Notice from 'src/components/Notice';
import { useAccount } from 'src/queries/account';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: 24,
    marginBottom: theme.spacing(2),
    padding: '4px 16px',
    backgroundColor: theme.bg.bgPaper,
    borderLeft: `5px solid ${theme.palette.status.warningDark}`,
    '& ul:first-of-type': {
      fontFamily: theme.font.normal,
      '& li': {
        fontSize: '0.875rem',
        marginBottom: theme.spacing(),
      },
    },
  },
  header: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  volumes: {
    marginTop: theme.spacing(),
    '& li': {
      fontFamily: theme.font.bold,
    },
  },
  checkbox: {
    marginLeft: theme.spacing(2),
  },
}));

interface Props {
  linodeVolumes: Volume[];
  hasConfirmed: boolean;
  setConfirmed: (value: boolean) => void;
  error?: string;
  migrationTimeInMins: number;
}

type CombinedProps = Props;

const CautionNotice: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { data: account } = useAccount();

  const capabilities = account?.capabilities ?? [];
  const vlansCapability = capabilities.includes('Vlans');

  const amountOfAttachedVolumes = props.linodeVolumes.length;

  return (
    <div className={classes.root}>
      <Typography className={classes.header}>
        <strong>Caution:</strong>
      </Typography>
      <ul>
        <li>
          You&rsquo;ll be assigned new IPv4 and IPv6 addresses, which will be
          accessible once your migration is complete.
        </li>
        <li>
          Any existing backups with the Linode Backup Service will not be
          migrated. Once your migration is complete, your backups will start
          over on their existing schedule.
        </li>
        <li>
          Any DNS records (including Reverse DNS) will need to be updated. You
          can use the <Link to="/domains">DNS Manager</Link> or{' '}
          <Link to="https://linode.com/docs/networking/dns/configure-your-linode-for-reverse-dns/">
            Configure Your Linode for Reverse DNS (rDNS).
          </Link>
        </li>
        {vlansCapability && (
          <li>
            Any attached VLANs will be inaccessible if the destination region
            does not support VLANs.{` `}
            <Link to="https://linode.com/docs/products/networking/vlans/">
              Check VLAN region compatibility.
            </Link>
          </li>
        )}
        <li>Your Linode will be powered off.</li>
        <li>
          Block Storage can&rsquo;t be migrated to other regions.{' '}
          {amountOfAttachedVolumes > 0 && (
            <React.Fragment>
              The following
              {amountOfAttachedVolumes > 1 ? ' volumes' : ' volume'} will be
              detached from this Linode:
              <ul className={classes.volumes}>
                {props.linodeVolumes.map((eachVolume) => {
                  return <li key={eachVolume.id}>{eachVolume.label}</li>;
                })}
              </ul>
            </React.Fragment>
          )}
        </li>
        <li>
          When this migration begins, we estimate it will take approximately{' '}
          {DateTime.local()
            .plus({ minutes: props.migrationTimeInMins })
            .toRelative()
            ?.replace('in', '')}{' '}
          to complete.
        </li>
      </ul>
      {props.error && <Notice error text={props.error} />}
      <Checkbox
        text="Accept"
        className={classes.checkbox}
        onChange={() => props.setConfirmed(!props.hasConfirmed)}
        checked={props.hasConfirmed}
      />
    </div>
  );
};

export default React.memo(CautionNotice);
