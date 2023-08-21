import {
  InterfacePayload,
  InterfacePurpose,
} from '@linode/api-v4/lib/linodes/types';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Divider } from 'src/components/Divider';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { TextField } from 'src/components/TextField';
import { useVlansQuery } from 'src/queries/vlans';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';

export interface Props {
  fromAddonsPanel?: boolean;
  handleChange: (updatedInterface: ExtendedInterface) => void;
  ipamAddress: null | string;
  ipamError?: string;
  label: null | string;
  labelError?: string;
  purpose: ExtendedPurpose;
  readOnly: boolean;
  region?: string;
  slotNumber: number;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = 'none' | InterfacePurpose;
export interface ExtendedInterface extends Omit<InterfacePayload, 'purpose'> {
  purpose: ExtendedPurpose;
}

export const InterfaceSelect = (props: Props) => {
  const theme = useTheme();
  const isSmallBp = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    fromAddonsPanel,
    handleChange,
    ipamAddress,
    ipamError,
    label,
    labelError,
    purpose,
    readOnly,
    region,
    slotNumber,
  } = props;

  const [newVlan, setNewVlan] = React.useState('');

  const purposeOptions: Item<ExtendedPurpose>[] = [
    {
      label: 'Public Internet',
      value: 'public',
    },
    {
      label: 'VLAN',
      value: 'vlan',
    },
    {
      label: 'None',
      value: 'none',
    },
  ];

  const { data: vlans, isLoading } = useVlansQuery();
  const vlanOptions =
    vlans
      ?.filter((thisVlan) => {
        // If a region is provided, only show VLANs in the target region as options
        return region ? thisVlan.region === region : true;
      })
      .map((thisVlan) => ({
        label: thisVlan.label,
        value: thisVlan.label,
      })) ?? [];

  if (Boolean(newVlan)) {
    vlanOptions.push({ label: newVlan, value: newVlan });
  }

  const handlePurposeChange = (selected: Item<InterfacePurpose>) => {
    const purpose = selected.value;
    handleChange({
      ipam_address: purpose === 'vlan' ? ipamAddress : '',
      label: purpose === 'vlan' ? label : '',
      purpose,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({ ipam_address: e.target.value, label, purpose });

  const handleLabelChange = (selected: Item<string>) =>
    handleChange({
      ipam_address: ipamAddress,
      label: selected?.value ?? '',
      purpose,
    });

  const handleCreateOption = (_newVlan: string) => {
    setNewVlan(_newVlan);
    handleChange({
      ipam_address: ipamAddress,
      label: _newVlan,
      purpose,
    });
  };

  return (
    <Grid container>
      {fromAddonsPanel ? null : (
        <Grid xs={12}>
          <Select
            options={
              // Do not display "None" as an option for eth0 (must be either Public Internet or a VLAN).
              slotNumber > 0
                ? purposeOptions
                : purposeOptions.filter(
                    (thisPurposeOption) => thisPurposeOption.value !== 'none'
                  )
            }
            value={purposeOptions.find(
              (thisOption) => thisOption.value === purpose
            )}
            disabled={readOnly}
            isClearable={false}
            label={`eth${slotNumber}`}
            onChange={handlePurposeChange}
          />
        </Grid>
      )}
      {purpose === 'vlan' ? (
        <Grid md={7} sm={9} xs={12}>
          <Grid
            sx={{
              flexDirection: 'row',
              [theme.breakpoints.down('sm')]: {
                flexDirection: 'column',
              },
            }}
            container
            spacing={isSmallBp ? 0 : 4}
          >
            <Grid sm={6} xs={12}>
              <Select
                noOptionsMessage={() =>
                  isLoading
                    ? 'Loading...'
                    : 'You have no VLANs in this region. Type to create one.'
                }
                value={
                  vlanOptions.find((thisVlan) => thisVlan.value === label) ??
                  null
                }
                creatable
                createOptionPosition="first"
                errorText={labelError}
                inputId={`vlan-label-${slotNumber}`}
                isClearable
                isDisabled={readOnly}
                label="VLAN"
                onChange={handleLabelChange}
                onCreateOption={handleCreateOption}
                options={vlanOptions}
                placeholder="Create or select a VLAN"
              />
            </Grid>
            <Grid sm={6} xs={12}>
              <TextField
                tooltipOnMouseEnter={() =>
                  sendLinodeCreateDocsEvent('IPAM Address Tooltip Hover')
                }
                tooltipText={
                  'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
                }
                disabled={readOnly}
                errorText={ipamError}
                inputId={`ipam-input-${slotNumber}`}
                label="IPAM Address"
                onChange={handleAddressChange}
                optional
                placeholder="192.0.2.0/24"
                value={ipamAddress}
              />
            </Grid>
          </Grid>
        </Grid>
      ) : null}

      {!fromAddonsPanel && (
        <Divider
          sx={{
            margin: `${theme.spacing(4.5)} ${theme.spacing()} ${theme.spacing(
              1.5
            )} `,
            width: `calc(100% - ${theme.spacing(2)})`,
          }}
        />
      )}
    </Grid>
  );
};
