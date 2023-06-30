import {
  InterfacePayload,
  InterfacePurpose,
} from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import Divider from 'src/components/Divider';
import { makeStyles } from '@mui/styles';
import { Theme, useTheme } from '@mui/material/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from '@mui/material/Unstable_Grid2';
import { TextField } from 'src/components/TextField';
import { useVlansQuery } from 'src/queries/vlans';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';
import useMediaQuery from '@mui/material/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    margin: `${theme.spacing(4.5)} ${theme.spacing()} ${theme.spacing(1.5)} `,
    width: `calc(100% - ${theme.spacing(2)})`,
  },
}));

export interface Props {
  slotNumber: number;
  purpose: ExtendedPurpose;
  label: string | null;
  ipamAddress: string | null;
  readOnly: boolean;
  region?: string;
  labelError?: string;
  ipamError?: string;
  handleChange: (updatedInterface: ExtendedInterface) => void;
  fromAddonsPanel?: boolean;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = InterfacePurpose | 'none';
export interface ExtendedInterface extends Omit<InterfacePayload, 'purpose'> {
  purpose: ExtendedPurpose;
}

export const InterfaceSelect: React.FC<Props> = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const isSmallBp = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    readOnly,
    slotNumber,
    purpose,
    label,
    ipamAddress,
    ipamError,
    labelError,
    region,
    handleChange,
    fromAddonsPanel,
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
      purpose,
      label: purpose === 'vlan' ? label : '',
      ipam_address: purpose === 'vlan' ? ipamAddress : '',
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({ purpose, label, ipam_address: e.target.value });

  const handleLabelChange = (selected: Item<string>) =>
    handleChange({
      purpose,
      ipam_address: ipamAddress,
      label: selected?.value ?? '',
    });

  const handleCreateOption = (_newVlan: string) => {
    setNewVlan(_newVlan);
    handleChange({
      purpose,
      ipam_address: ipamAddress,
      label: _newVlan,
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
            label={`eth${slotNumber}`}
            value={purposeOptions.find(
              (thisOption) => thisOption.value === purpose
            )}
            onChange={handlePurposeChange}
            disabled={readOnly}
            isClearable={false}
          />
        </Grid>
      )}
      {purpose === 'vlan' ? (
        <Grid xs={12} sm={9} md={7}>
          <Grid
            container
            sx={{
              flexDirection: 'row',
              [theme.breakpoints.down('sm')]: {
                flexDirection: 'column',
              },
            }}
            spacing={isSmallBp ? 0 : 4}
          >
            <Grid xs={12} sm={6}>
              <Select
                inputId={`vlan-label-${slotNumber}`}
                errorText={labelError}
                options={vlanOptions}
                label="VLAN"
                placeholder="Create or select a VLAN"
                creatable
                createOptionPosition="first"
                value={
                  vlanOptions.find((thisVlan) => thisVlan.value === label) ??
                  null
                }
                onChange={handleLabelChange}
                onCreateOption={handleCreateOption}
                isClearable
                isDisabled={readOnly}
                noOptionsMessage={() =>
                  isLoading
                    ? 'Loading...'
                    : 'You have no VLANs in this region. Type to create one.'
                }
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                inputId={`ipam-input-${slotNumber}`}
                label="IPAM Address"
                disabled={readOnly}
                errorText={ipamError}
                onChange={handleAddressChange}
                optional
                placeholder="192.0.2.0/24"
                tooltipOnMouseEnter={() =>
                  sendLinodeCreateDocsEvent('IPAM Address Tooltip Hover')
                }
                tooltipText={
                  'IPAM address must use IP/netmask format, e.g. 192.0.2.0/24.'
                }
                value={ipamAddress}
              />
            </Grid>
          </Grid>
        </Grid>
      ) : null}

      {!fromAddonsPanel && <Divider className={classes.divider} />}
    </Grid>
  );
};

export default InterfaceSelect;
