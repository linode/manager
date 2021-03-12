import { Interface, InterfacePurpose } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField from 'src/components/TextField';
import Grid from 'src/components/Grid';
import useVlansQuery from 'src/queries/vlans';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  vlanInputs: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
  },
}));

export interface Props {
  slotNumber: number;
  purpose: ExtendedPurpose;
  label: string;
  ipamAddress: string | null;
  readOnly: boolean;
  handleChange: (updatedInterface: ExtendedInterface) => void;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = InterfacePurpose | 'none';
export interface ExtendedInterface extends Omit<Interface, 'purpose'> {
  purpose: ExtendedPurpose;
}

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

export const InterfaceSelect: React.FC<Props> = (props) => {
  const {
    readOnly,
    slotNumber,
    purpose,
    label,
    ipamAddress,
    handleChange,
  } = props;

  const classes = useStyles();

  const { data: vlans, isLoading } = useVlansQuery();
  const vlanOptions =
    vlans?.map((thisVlan) => ({
      label: thisVlan.description,
      value: thisVlan.description,
    })) ?? [];

  const handlePurposeChange = (selected: Item<InterfacePurpose>) =>
    handleChange({ purpose: selected.value, label, ipam_address: ipamAddress });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({ purpose, label, ipam_address: e.target.value });

  const handleLabelChange = (selected: Item<string>) =>
    handleChange({ purpose, ipam_address: ipamAddress, label: selected.value });

  return (
    <Grid container>
      <Grid item xs={6}>
        <Select
          options={purposeOptions}
          label={`eth${slotNumber}`}
          defaultValue={purposeOptions.find(
            (thisOption) => thisOption.value === purpose
          )}
          onChange={handlePurposeChange}
          onCreate
          disabled={readOnly}
          isClearable={false}
        />
      </Grid>
      {purpose === 'vlan' ? (
        <Grid item xs={6}>
          <Grid container direction="column">
            <Grid item>
              <Select
                options={vlanOptions}
                label="Label"
                placeholder="Create or select a VLAN"
                variant="creatable"
                createOptionPosition="first"
                defaultValue={vlanOptions.find(
                  (thisVlan) => thisVlan.value === label
                )}
                onChange={handleLabelChange}
                isClearable={false}
              />
            </Grid>
            <Grid item>
              <TextField
                label="IPAM Address (optional)"
                value={ipamAddress}
                onChange={handleAddressChange}
              />
            </Grid>
          </Grid>
        </Grid>
      ) : null}
    </Grid>
  );
};

export default InterfaceSelect;
