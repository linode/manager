import { Interface } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Accordion } from 'src/components/Accordion';
import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';
import { queryKey as vlansQueryKey } from 'src/queries/vlans';
import { arrayToList } from 'src/utilities/arrayToList';
import {
  doesRegionSupportFeature,
  regionsWithFeature,
} from 'src/utilities/doesRegionSupportFeature';

import { InterfaceSelect } from '../LinodesDetail/LinodeSettings/InterfaceSelect';

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

export const VLANAccordion = React.memo((props: Props) => {
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
    <Accordion
      detailProps={{
        sx: {
          padding: '0px 24px 24px 24px',
        },
      }}
      heading={
        <Box display="flex">
          VLAN
          {helperText && (
            <TooltipIcon
              status="help"
              sxTooltipIcon={{ alignItems: 'baseline', padding: '0 8px' }}
              text={helperText}
            />
          )}
        </Box>
      }
      summaryProps={{
        sx: {
          padding: '5px 24px 0px 24px',
        },
      }}
      sx={{
        marginTop: 2,
      }}
      data-qa-add-ons
      data-testid="vlan-accordion"
    >
      <Typography>{regionalAvailabilityMessage}</Typography>
      <Typography sx={{ marginTop: 2 }} variant="body1">
        VLANs are used to create a private L2 Virtual Local Area Network between
        Linodes. A VLAN created or attached in this section will be assigned to
        the eth1 interface, with eth0 being used for connections to the public
        internet. VLAN configurations can be further edited in the
        Linode&rsquo;s{' '}
        <Link to="https://www.linode.com/docs/guides/linode-configuration-profiles/">
          Configuration Profile
        </Link>
        .
      </Typography>
      <InterfaceSelect
        errors={{
          ipamError,
          labelError,
        }}
        handleChange={(newInterface: Interface) =>
          handleVLANChange(newInterface)
        }
        fromAddonsPanel
        ipamAddress={ipamAddress}
        label={vlanLabel}
        purpose="vlan"
        readOnly={readOnly || !regionSupportsVLANs || false}
        region={region}
        slotNumber={1}
      />
    </Accordion>
  );
});
