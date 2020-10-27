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
  selectedVlanIDs: number[];
  error?: string;
  handleSelectVLAN: (vlanIDs: number[]) => void;
}

export const SelectVLAN: React.FC<Props> = props => {
  const { error, selectedRegionID, selectedVlanIDs, handleSelectVLAN } = props;
  useReduxLoad(['vlans']);
  const classes = useStyles();

  React.useEffect(() => {
    /**
     * If the user changes the selected region,
     * clear the VLAN selection, since VLANs can
     * only be attached to Linodes in the same data
     * center.
     */
    handleSelectVLAN([]);
  }, [selectedRegionID, handleSelectVLAN]);

  const disabled = !Boolean(selectedRegionID);

  const helperText = disabled
    ? 'You must select a region before choosing a VLAN.'
    : undefined;

  const { vlans } = useVlans();

  const options = React.useMemo(() => {
    return Object.values(vlans.itemsById)
      .filter(thisVlan => thisVlan.region === selectedRegionID)
      .map(thisVlan => ({
        label: thisVlan.description || thisVlan.id,
        value: thisVlan.id
      }));
  }, [selectedRegionID, vlans]);

  const selected = selectedVlanIDs.map(thisID => ({
    label: vlans.itemsById[thisID].description,
    value: thisID
  }));

  const onChange = (selected: Item<number>[]) => {
    const ids = selected.map(i => i.value);
    handleSelectVLAN(ids);
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
        Attach the new Linode to one or more virtual LANs.
      </Typography>
      <Select
        options={options}
        isMulti
        isClearable
        value={selected}
        label={'Select VLANs'}
        aria-describedby={helperText}
        hideLabel
        disabled={disabled}
        errorText={error || vlanError}
        noOptionsMessage={() => 'No VLANs available in the selected region.'}
        placeholder="Select one or more VLANs"
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
