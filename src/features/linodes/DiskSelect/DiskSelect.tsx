import * as React from 'react';
import { compose } from 'recompose';
import {
  createStyles,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

interface Props {
  generalError?: string;
  diskError?: string;
  disks: Linode.Disk[];
  selectedDisk: string | null;
  disabled?: boolean;
  handleChange: (disk: string | null) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const disksToOptions = (disks: Linode.Disk[]): Item<string>[] => {
  return disks.map(disk => ({ label: disk.label, value: String(disk.id) }));
};

const diskFromValue = (
  disks: Item<string>[],
  diskId: string | null
): Item<string> | null => {
  if (!diskId) {
    return null;
  }
  const thisDisk = disks.find(disk => disk.value === diskId);
  return thisDisk ? thisDisk : null;
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
      onChange={(newDisk: Item<string> | null) =>
        handleChange(newDisk ? newDisk.value : null)
      }
      errorText={generalError || diskError}
    />
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props & RenderGuardProps>(
  styled,
  RenderGuard
)(DiskSelect);
