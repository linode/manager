import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';

interface Props {
  generalError?: string;
  diskError?: string;
  disks: Disk[];
  selectedDisk: string | null;
  disabled?: boolean;
  handleChange: (disk: string | null) => void;
}

type CombinedProps = Props;

const disksToOptions = (disks: Disk[]): Item<string>[] => {
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

const DiskSelect: React.FC<CombinedProps> = props => {
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

export default compose<CombinedProps, Props & RenderGuardProps>(RenderGuard)(
  DiskSelect
);
