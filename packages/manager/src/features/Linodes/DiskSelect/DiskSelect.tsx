import { Disk } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';

import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';

interface Props {
  disabled?: boolean;
  diskError?: string;
  disks: Disk[];
  generalError?: string;
  handleChange: (disk: null | string) => void;
  required?: boolean;
  selectedDisk: null | string;
}

type CombinedProps = Props;

const disksToOptions = (disks: Disk[]): Item<string>[] => {
  return disks.map((disk) => ({ label: disk.label, value: String(disk.id) }));
};

const diskFromValue = (
  disks: Item<string>[],
  diskId: null | string
): Item<string> | null => {
  if (!diskId) {
    return null;
  }
  const thisDisk = disks.find((disk) => disk.value === diskId);
  return thisDisk ? thisDisk : null;
};

const DiskSelect: React.FC<CombinedProps> = (props) => {
  const {
    disabled,
    diskError,
    disks,
    generalError,
    handleChange,
    required,
    selectedDisk,
  } = props;
  const options = disksToOptions(disks);
  return (
    <EnhancedSelect
      onChange={(newDisk: Item<string> | null) =>
        handleChange(newDisk ? newDisk.value : null)
      }
      disabled={disabled}
      errorText={generalError || diskError}
      label={'Disk'}
      options={options}
      placeholder={'Select a Disk'}
      required={required}
      value={diskFromValue(options, selectedDisk)}
    />
  );
};

export default compose<CombinedProps, Props & RenderGuardProps>(RenderGuard)(
  DiskSelect
);
