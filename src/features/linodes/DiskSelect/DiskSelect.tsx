import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  generalError?: string;
  diskError?: string;
  disks: Linode.Disk[];
  selectedDisk?: string;
  disabled?: boolean;
  handleChange: (disk: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const disksToOptions = (disks: Linode.Disk[]): Item<string>[] => {
  return disks.map(disk => ({ label: disk.label, value: String(disk.id) }));
};

const diskFromValue = (
  disks: Item<string>[],
  diskId?: string
): Item<string> | undefined => {
  if (!diskId) {
    return;
  }
  return disks.find(thisDisk => thisDisk.value === diskId);
};

const DiskSelect: React.StatelessComponent<CombinedProps> = props => {
  const {
    disabled,
    disks,
    diskError,
    generalError,
    handleChange,
    selectedDisk
  } = props;
  const options = disksToOptions(disks);
  return (
    <EnhancedSelect
      label={'Disk'}
      placeholder={'Select a Disk'}
      disabled={disabled}
      options={options}
      value={diskFromValue(options, selectedDisk)}
      onChange={(newDisk: Item<string>) => handleChange(newDisk.value)}
      errorText={generalError || diskError}
    />
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  styled,
  RenderGuard
)(DiskSelect);
