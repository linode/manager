import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVlans from 'src/hooks/useVlans';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    color: theme.color.headline,
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    lineHeight: '1.2em'
  },
  helperText: {
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing()
  }
}));

export interface Props {
  selectedRegionID?: string;
  selectedVlanID: number | null;
  error?: string;
  handleSelectVLAN: (vlanID: number | null) => void;
}

export const SelectVLAN: React.FC<Props> = props => {
  const { error, selectedRegionID, selectedVlanID, handleSelectVLAN } = props;
  useReduxLoad(['vlans']);
  const classes = useStyles();

  React.useEffect(() => {
    /**
     * If the user changes the selected region,
     * clear the VLAN selection, since VLANs can
     * only be attached to Linodes in the same data
     * center.
     */
    handleSelectVLAN(null);
  }, [selectedRegionID, handleSelectVLAN]);

  const disabled = !Boolean(selectedRegionID);

  const helperText = disabled
    ? 'You must select a region before choosing a VLAN.'
    : '';

  const { vlans } = useVlans();

  const options = React.useMemo(() => {
    return Object.values(vlans.itemsById)
      .filter(thisVlan => thisVlan.region === selectedRegionID)
      .map(thisVlan => ({
        label: thisVlan.description || thisVlan.id,
        value: thisVlan.id
      }));
  }, [selectedRegionID, vlans]);

  const onChange = (selected: Item<number> | null) => {
    const value = selected === null ? selected : selected.value;
    handleSelectVLAN(value);
  };

  const vlanError = vlans.error.read
    ? getAPIErrorOrDefault(vlans.error.read, 'Error loading VLANs')[0].reason
    : undefined;

  const _Select = (
    <>
      <Typography className={classes.header}>
        <strong>Virtual LAN</strong>
      </Typography>
      <Typography className={classes.helperText}>
        Attach the new Linode to a virtual LAN.
      </Typography>
      <Select
        options={options}
        isClearable
        value={
          options.find(thisOption => thisOption.value === selectedVlanID) ??
          null
        }
        label={'Select a VLAN'}
        aria-describedby={helperText}
        hideLabel
        disabled={disabled}
        errorText={error || vlanError}
        noOptionsMessage={() => 'No VLANs available in the selected region.'}
        placeholder="Select a VLAN"
        onChange={onChange}
      />
    </>
  );

  return disabled ? (
    <Tooltip title={helperText} placement="bottom-start">
      <div>{_Select}</div>
    </Tooltip>
  ) : (
    _Select
  );
};

export default React.memo(SelectVLAN);
