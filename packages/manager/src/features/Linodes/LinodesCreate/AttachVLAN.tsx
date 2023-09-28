import { Interface } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';
import { queryKey as vlansQueryKey } from 'src/queries/vlans';
import arrayToList from 'src/utilities/arrayToDelimiterSeparatedList';
import {
  doesRegionSupportFeature,
  regionsWithFeature,
} from 'src/utilities/doesRegionSupportFeature';

import { InterfaceSelect } from '../LinodesDetail/LinodeSettings/InterfaceSelect';

// @TODO Delete this file when VPC is released

interface Props {
  handleVLANChange: (updatedInterface: Interface) => void;
  helperText?: string;
  ipamAddress: string;
  ipamError?: string;
  labelError?: string;
  readOnly?: boolean;
  region?: string;
  vlanLabel: string;
}

export const AttachVLAN = React.memo((props: Props) => {
  const {
    handleVLANChange,
    helperText,
    ipamAddress,
    ipamError,
    labelError,
    readOnly,
    region,
    vlanLabel,
  } = props;

  const theme = useTheme();

  const queryClient = useQueryClient();

  React.useEffect(() => {
    // Ensure VLANs are fresh.
    queryClient.invalidateQueries(vlansQueryKey);
  }, []);

  const regions = useRegionsQuery().data ?? [];
  const selectedRegion = region || '';

  const regionSupportsVLANs = doesRegionSupportFeature(
    selectedRegion,
    regions,
    'Vlans'
  );

  const regionsThatSupportVLANs = regionsWithFeature(regions, 'Vlans').map(
    (region) => region.label
  );

  const regionalAvailabilityMessage = `VLANs are currently available in ${arrayToList(
    regionsThatSupportVLANs,
    ';'
  )}.`;

  return (
    <Paper
      data-qa-add-ons
      data-testid="attach-vlan"
      sx={{ marginTop: theme.spacing(3) }}
    >
      <Typography
        sx={{
          '& button': {
            paddingLeft: theme.spacing(),
          },
          alignItems: 'center',
          display: 'flex',
          marginBottom: theme.spacing(2),
        }}
        variant="h2"
      >
        Attach a VLAN{' '}
        {helperText ? <TooltipIcon status="help" text={helperText} /> : null}
      </Typography>
      <Grid container>
        <Grid xs={12}>
          <Typography>{regionalAvailabilityMessage}</Typography>
          <Typography sx={{ marginTop: theme.spacing(2) }} variant="body1">
            VLANs are used to create a private L2 Virtual Local Area Network
            between Linodes. A VLAN created or attached in this section will be
            assigned to the eth1 interface, with eth0 being used for connections
            to the public internet. VLAN configurations can be further edited in
            the Linode&rsquo;s{' '}
            <Link to="https://www.linode.com/docs/guides/linode-configuration-profiles/">
              Configuration Profile
            </Link>
            .
          </Typography>
          <InterfaceSelect
            handleChange={(newInterface: Interface) =>
              handleVLANChange(newInterface)
            }
            fromAddonsPanel
            ipamAddress={ipamAddress}
            ipamError={ipamError}
            label={vlanLabel}
            labelError={labelError}
            purpose="vlan"
            readOnly={readOnly || !regionSupportsVLANs || false}
            region={region}
            slotNumber={1}
          />
        </Grid>
      </Grid>
    </Paper>
  );
});
