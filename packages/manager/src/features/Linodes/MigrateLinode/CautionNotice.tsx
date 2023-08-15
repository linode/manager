import { styled, useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import { Checkbox } from 'src/components/Checkbox';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { API_MAX_PAGE_SIZE } from 'src/constants';
import { useLinodeVolumesQuery } from 'src/queries/volumes';

interface Props {
  error?: string;
  hasConfirmed: boolean;
  linodeId: number | undefined;
  metadataWarning?: string;
  migrationTimeInMins: number;
  setConfirmed: (value: boolean) => void;
}

export const CautionNotice = React.memo((props: Props) => {
  const theme = useTheme();

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
    <StyledRootDiv>
      <Typography
        sx={{
          marginLeft: theme.spacing(2),
          marginTop: theme.spacing(2),
        }}
      >
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
              <StyledVolumeUl>
                {volumesData?.data.map((eachVolume) => {
                  return <li key={eachVolume.id}>{eachVolume.label}</li>;
                })}
              </StyledVolumeUl>
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
      {props.error && <Notice variant="error" text={props.error} />}
      <Checkbox
        sx={{
          marginLeft: theme.spacing(2),
        }}
        checked={props.hasConfirmed}
        onChange={() => props.setConfirmed(!props.hasConfirmed)}
        text="Accept"
      />
    </StyledRootDiv>
  );
});

const StyledRootDiv = styled('div', { label: 'StyledRootDiv' })(
  ({ theme }) => ({
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
    padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
  })
);

const StyledVolumeUl = styled('div', { label: 'StyledVolumeUl' })(
  ({ theme }) => ({
    '& li': {
      fontFamily: theme.font.bold,
    },
    marginTop: theme.spacing(),
  })
);
