import { Interface, InterfacePurpose } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { makeStyles, Theme } from 'src/components/core/styles';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
}));

export interface Props {
  slotNumber: number;
  purpose: ExtendedPurpose;
  label: string;
  ipamAddress: string | null;
  readOnly: boolean;
  handleChange: (updatedInterface: Interface) => void;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = InterfacePurpose | 'none';

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

  const [vlanLabel, setVlanLabel] = React.useState('');
  const vlans: Item<string>[] = [];

  const handlePurposeChange = (selected: Item<InterfacePurpose>) =>
    handleChange({ purpose: selected.value, label, ipam_address: ipamAddress });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({ purpose, label, ipam_address: e.target.value });

  const handleLabelChange = (selected: Item<string>) =>
    handleChange({ purpose, ipam_address: ipamAddress, label: selected.value });

  return (
    <div className={classes.root}>
      <Select
        options={purposeOptions}
        label={`eth${slotNumber}`}
        defaultValue={purposeOptions.find(
          (thisOption) => thisOption.value === purpose
        )}
        onChange={handlePurposeChange}
        disabled={readOnly}
        isClearable={false}
      />
      {purpose === 'vlan' ? (
        <>
          <Select
            options={vlans}
            label="Label"
            placeholder="Create or select a VLAN"
            defaultValue={vlans.find(
              (thisVlan) => thisVlan.value === vlanLabel
            )}
            onChange={handleLabelChange}
            isClearable={false}
          />
          <TextField
            label="IPAM Address (optional)"
            value={ipamAddress}
            onChange={handleAddressChange}
          />
        </>
      ) : null}
    </div>
  );
};

export default InterfaceSelect;
