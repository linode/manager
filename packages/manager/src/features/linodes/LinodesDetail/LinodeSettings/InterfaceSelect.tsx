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
  vlanGrid: {
    minWidth: 450,
    '& .react-select__menu': {
      marginTop: 20,
      '& p': {
        paddingLeft: theme.spacing(),
      },
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      minWidth: 'auto',
    },
  },
  vlanLabelField: {
    width: 202,
    height: 35,
    marginRight: theme.spacing(),
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  ipamAddressLabel: {
    '& label': {
      whiteSpace: 'nowrap',
    },
    [theme.breakpoints.down('md')]: {
      width: 200,
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  configsWrapper: {
    [theme.breakpoints.down('xs')]: {
      marginTop: -theme.spacing(2),
    },
  },
}));

export interface Props {
  slotNumber: number;
  purpose: ExtendedPurpose;
  label: string;
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
        <Grid item xs={12} sm={6}>
          <Select
            options={purposeOptions}
            label={`eth${slotNumber}`}
            value={purposeOptions.find(
              (thisOption) => thisOption.value === purpose
            )}
            onChange={handlePurposeChange}
            onCreate
            disabled={readOnly}
            isClearable={false}
          />
        </Grid>
      )}
      {purpose === 'vlan' ? (
        <Grid item xs={12} sm={6}>
          <Grid
            container
            direction={fromAddonsPanel ? 'row' : 'column'}
            className={fromAddonsPanel ? classes.vlanGrid : ''}
          >
            <Grid
              item
              className={!fromAddonsPanel ? classes.configsWrapper : ''}
              xs={12}
              sm={fromAddonsPanel ? 6 : 12}
            >
              <Select
                inputId={`vlan-label-${slotNumber}`}
                className={fromAddonsPanel ? classes.vlanLabelField : ''}
                errorText={labelError}
                options={vlanOptions}
                label="Label"
                placeholder="Create or select a VLAN"
                variant="creatable"
                createOptionPosition="first"
                value={
                  vlanOptions.find((thisVlan) => thisVlan.value === label) ??
                  null
                }
                onChange={handleLabelChange}
                createNew={handleCreateOption}
                isClearable
                disabled={readOnly}
                noOptionsMessage={() =>
                  isLoading
                    ? 'Loading...'
                    : 'You have no VLANs in this region. Type to create one.'
                }
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={fromAddonsPanel ? 6 : 12}
              className={fromAddonsPanel ? '' : 'py0'}
              style={fromAddonsPanel ? {} : { marginTop: -8, marginBottom: 8 }}
            >
              <div className={fromAddonsPanel ? classes.ipamAddressLabel : ''}>
                <TextField
                  inputId={`ipam-input-${slotNumber}`}
                  label="IPAM Address (Optional)"
                  value={ipamAddress}
                  errorText={ipamError}
                  onChange={handleAddressChange}
                  disabled={readOnly}
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
      ) : null}

      <Divider className={classes.divider} />
    </Grid>
  );
};

export default InterfaceSelect;
