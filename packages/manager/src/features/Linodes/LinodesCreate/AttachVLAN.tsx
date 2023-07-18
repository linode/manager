import { Interface } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import ExternalLink from 'src/components/ExternalLink';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';
import { useRegionsQuery } from 'src/queries/regions';
import { queryKey as vlansQueryKey } from 'src/queries/vlans';
import arrayToList from 'src/utilities/arrayToDelimiterSeparatedList';
import {
  doesRegionSupportFeature,
  regionsWithFeature,
} from 'src/utilities/doesRegionSupportFeature';

import InterfaceSelect from '../LinodesDetail/LinodeSettings/InterfaceSelect';

// @TODO Delete this file when VPC is released
const useStyles = makeStyles((theme: Theme) => ({
  paragraphBreak: {
    marginTop: theme.spacing(2),
  },
  title: {
    '& button': {
      paddingLeft: theme.spacing(),
    },
    alignItems: 'center',
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  vlan: {
    marginTop: theme.spacing(3),
  },
}));

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

type CombinedProps = Props;

const AttachVLAN: React.FC<CombinedProps> = (props) => {
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

  const classes = useStyles();

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
    <Paper className={classes.vlan} data-qa-add-ons>
      <Typography className={classes.title} variant="h2">
        Attach a VLAN{' '}
        {helperText ? <TooltipIcon status="help" text={helperText} /> : null}
      </Typography>
      <Grid container>
        <Grid xs={12}>
          <Typography>{regionalAvailabilityMessage}</Typography>
          <Typography className={classes.paragraphBreak} variant="body1">
            VLANs are used to create a private L2 Virtual Local Area Network
            between Linodes. A VLAN created or attached in this section will be
            assigned to the eth1 interface, with eth0 being used for connections
            to the public internet. VLAN configurations can be further edited in
            the Linode&rsquo;s{' '}
            <ExternalLink
              hideIcon
              link="https://www.linode.com/docs/guides/linode-configuration-profiles/"
              text="Configuration Profile"
            />
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
};

export default React.memo(AttachVLAN);
