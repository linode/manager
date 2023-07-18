import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import { Checkbox } from 'src/components/Checkbox';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { API_MAX_PAGE_SIZE } from 'src/constants';
import { useLinodeVolumesQuery } from 'src/queries/volumes';

const useStyles = makeStyles((theme: Theme) => ({
  checkbox: {
    marginLeft: theme.spacing(2),
  },
  header: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  root: {
    '& ul:first-of-type': {
      '& li': {
        fontSize: '0.875rem',
        marginBottom: theme.spacing(),
      },
      fontFamily: theme.font.normal,
    },
    backgroundColor: theme.bg.bgPaper,
    borderLeft: `5px solid ${theme.palette.warning.dark}`,
    marginBottom: theme.spacing(2),
    marginTop: 24,
    padding: '4px 16px',
  },
  volumes: {
    '& li': {
      fontFamily: theme.font.bold,
    },
    marginTop: theme.spacing(),
  },
}));

interface Props {
  error?: string;
  hasConfirmed: boolean;
  linodeId: number | undefined;
  metadataWarning?: string;
  migrationTimeInMins: number;
  setConfirmed: (value: boolean) => void;
}

const CautionNotice = (props: Props) => {
  const classes = useStyles();

  // This is not great, but lets us get all of the volumes for a Linode while keeping
  // the React Query store in a paginated shape. We want to keep data in a paginated shape
  // because the event handler automatically updates stored paginated data.
  // We can safely do this because linodes can't have more than 64 volumes.
  const { data: volumesData } = useLinodeVolumesQuery(
    props.linodeId ?? -1,
    {
      page_size: API_MAX_PAGE_SIZE,
    },
    {},
    props.linodeId !== undefined
  );

  const amountOfAttachedVolumes = volumesData?.results ?? 0;

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
        <li>
          Any attached VLANs will be inaccessible if the destination region does
          not support VLANs.{` `}
          <Link to="https://linode.com/docs/products/networking/vlans/">
            Check VLAN region compatibility.
          </Link>
        </li>
        <li>Your Linode will be powered off.</li>
        <li>
          Block Storage can&rsquo;t be migrated to other regions.{' '}
          {amountOfAttachedVolumes > 0 && (
            <React.Fragment>
              The following
              {amountOfAttachedVolumes > 1 ? ' volumes' : ' volume'} will be
              detached from this Linode:
              <ul className={classes.volumes}>
                {volumesData?.data.map((eachVolume) => {
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
        {props.metadataWarning ? <li>{props.metadataWarning}</li> : null}
      </ul>
      {props.error && <Notice error text={props.error} />}
      <Checkbox
        checked={props.hasConfirmed}
        className={classes.checkbox}
        onChange={() => props.setConfirmed(!props.hasConfirmed)}
        text="Accept"
      />
    </div>
  );
};

export default React.memo(CautionNotice);
