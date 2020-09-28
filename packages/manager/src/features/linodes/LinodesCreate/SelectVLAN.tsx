import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Tooltip from 'src/components/core/Tooltip';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVlans from 'src/hooks/useVlans';

export interface Props {
  selectedRegionID?: string;
  selectedVlanID: number | null;
  handleSelectVLAN: (vlanID: number | null) => void;
}

export const SelectVLAN: React.FC<Props> = props => {
  const { selectedRegionID, selectedVlanID, handleSelectVLAN } = props;
  useReduxLoad(['vlans']);

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

  const onChange = (selected: Item<number> | null) => {
    const value = selected === null ? selected : selected.value;
    handleSelectVLAN(value);
  };

  const _Select = (
    <Select
      options={options}
      isClearable
      value={
        options.find(thisOption => thisOption.value === selectedVlanID) ?? null
      }
      label={'Virtual LAN'}
      disabled={disabled}
      noOptionsMessage={() => 'No VLANS available in the selected region.'}
      placeholder="Select a VLAN"
      onChange={onChange}
      textFieldProps={{
        helperText: 'Attach the new Linode to a Virtual LAN',
        helperTextPosition: 'top'
      }}
    />
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
