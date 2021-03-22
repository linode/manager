import { Interface, InterfacePurpose } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import useVlansQuery from 'src/queries/vlans';

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    margin: `${theme.spacing(2)}px ${theme.spacing(1)}px 0 `,
    width: `calc(100% - ${theme.spacing(2)}px)`,
  },
}));

export interface Props {
  slotNumber: number;
  purpose: ExtendedPurpose;
  label: string;
  ipamAddress: string | null;
  readOnly: boolean;
  labelError?: string;
  ipamError?: string;
  handleChange: (updatedInterface: ExtendedInterface) => void;
}

// To allow for empty slots, which the API doesn't account for
export type ExtendedPurpose = InterfacePurpose | 'none';
export interface ExtendedInterface extends Omit<Interface, 'purpose'> {
  purpose: ExtendedPurpose;
}

export const InterfaceSelect: React.FC<Props> = (props) => {
  const classes = useStyles();

  const {
    readOnly,
    slotNumber,
    purpose,
    label,
    ipamAddress,
    ipamError,
    labelError,
    handleChange,
  } = props;

  const purposeOptions: Item<ExtendedPurpose>[] = [
    slotNumber === 0
      ? {
          label: 'Public Internet',
          value: 'public',
        }
      : null,
    {
      label: 'VLAN',
      value: 'vlan',
    },
    {
      label: 'None',
      value: 'none',
    },
  ].filter(Boolean) as Item<ExtendedPurpose>[];

  const { data: vlans, isLoading } = useVlansQuery();
  const vlanOptions =
    vlans?.map((thisVlan) => ({
      label: thisVlan.label,
      value: thisVlan.label,
    })) ?? [];

  const handlePurposeChange = (selected: Item<InterfacePurpose>) =>
    handleChange({ purpose: selected.value, label, ipam_address: ipamAddress });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleChange({ purpose, label, ipam_address: e.target.value });

  const handleLabelChange = (selected: Item<string>) =>
    handleChange({
      purpose,
      ipam_address: ipamAddress,
      label: selected?.value ?? '',
    });

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
        <>
          <Grid item xs={6}>
            <Grid container direction="column">
              <Grid item>
                <Select
                  errorText={labelError}
                  options={vlanOptions}
                  isLoading={isLoading}
                  label="Label"
                  placeholder="Create or select a VLAN"
                  variant="creatable"
                  createOptionPosition="first"
                  defaultValue={vlanOptions.find(
                    (thisVlan) => thisVlan.value === label
                  )}
                  onChange={handleLabelChange}
                  isClearable={true}
                />
              </Grid>
              <Grid
                item
                className="py0"
                style={{ marginTop: -8, marginBottom: 8 }}
              >
                <TextField
                  label="IPAM Address (optional)"
                  value={ipamAddress}
                  errorText={ipamError}
                  onChange={handleAddressChange}
                />
              </Grid>
            </Grid>
          </Grid>
          {/* {slotNumber !== 2 && <Divider className={classes.divider} />} */}
        </>
      ) : null}

      <Divider className={classes.divider} />
    </Grid>
  );
};

export default InterfaceSelect;
