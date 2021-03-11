import * as React from 'react';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
}));

export interface Props {
  slotNumber: number;
  readOnly: boolean;
}

export interface Slot {
  type: 'vlan' | 'public';
  label: string;
}

const slotOptions: Item<string>[] = [
  {
    label: 'Public Internet',
    value: 'public',
  },
  {
    label: 'VLAN',
    value: 'vlan',
  },
];

export const InterfaceSelect: React.FC<Props> = (props) => {
  const { readOnly, slotNumber } = props;
  const classes = useStyles();

  const [vlanLabel, setVlanLabel] = React.useState('');
  const vlans: Item<string>[] = [];

  const [slotType, setSlotType] = React.useState('public');

  const onChangeType = (selected: Item<string>) => {
    setSlotType(selected.value);
  };

  const onChangeLabel = (selected: Item<string>) => null;
  return (
    <div className={classes.root}>
      <Select
        options={slotOptions}
        label={`eth${slotNumber}`}
        defaultValue={slotOptions.find(
          (thisOption) => thisOption.value === slotType
        )}
        onChange={onChangeType}
        disabled={readOnly}
        isClearable={false}
      />
      {slotType === 'vlan' ? (
        <Select
          options={vlans}
          label="Label"
          placeholder="Create or select a VLAN"
          defaultValue={vlans.find((thisVlan) => thisVlan.value === vlanLabel)}
          onChange={onChangeLabel}
          isClearable={false}
        />
      ) : null}
    </div>
  );
};

export default InterfaceSelect;
