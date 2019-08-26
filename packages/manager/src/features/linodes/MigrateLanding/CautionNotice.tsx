import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Checkbox from 'src/components/CheckBox';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.white,
    '& ul:first-of-type': {
      fontFamily: theme.font.normal,
      '& li': {
        marginBottom: theme.spacing()
      }
    }
  },
  header: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2)
  },
  volumes: {
    marginTop: theme.spacing(),
    '& li': {
      fontFamily: theme.font.bold
    }
  },
  checkbox: {
    marginLeft: theme.spacing(2)
  }
}));

interface Props {
  linodeVolumes: Linode.Volume[];
  hasConfirmed: boolean;
  setConfirmed: (value: boolean) => void;
  error?: string;
  migrationTimeInMins: number;
}

type CombinedProps = Props;

const CautionNotice: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const amountOfAttachedVolumes = props.linodeVolumes.length;

  return (
    <Notice warning className={classes.root} spacingTop={24}>
      <Typography className={classes.header}>
        <strong>Caution:</strong>
      </Typography>
      <ul>
        <li>
          You'll be assigned new IPv4 and IPv6 addresses, which will be
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
          <a
            href="https://linode.com/docs/networking/dns/configure-your-linode-for-reverse-dns/"
            target="_blank"
          >
            Configure Your Linode for Reverse DNS (rDNS).
          </a>
        </li>
        <li>Your Linode will be powered off.</li>
        <li>
          Block Storage can't be migrated to other regions.{' '}
          {amountOfAttachedVolumes > 0 && (
            <React.Fragment>
              The following
              {amountOfAttachedVolumes > 1 ? ' volumes' : ' volume'} will be
              detached from this Linode:
              <ul className={classes.volumes}>
                {props.linodeVolumes.map(eachVolume => {
                  return <li key={eachVolume.id}>{eachVolume.label}</li>;
                })}
              </ul>
            </React.Fragment>
          )}
        </li>
        <li>
          When this migration begins, we estimate it will take approximately{' '}
          {moment.duration(props.migrationTimeInMins, 'minutes').humanize()} to
          complete.
        </li>
      </ul>
      {props.error && <Notice error text={props.error} />}
      <Checkbox
        text="Accept"
        className={classes.checkbox}
        onChange={() => props.setConfirmed(!props.hasConfirmed)}
        checked={props.hasConfirmed}
      />
    </Notice>
  );
};

export default compose<CombinedProps, Props>(React.memo)(CautionNotice);
