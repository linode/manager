import { Kernel } from '@linode/api-v4/lib/linodes/types';
import { groupBy } from 'ramda';
import * as React from 'react';

import Select, { GroupType, Item } from 'src/components/EnhancedSelect/Select';

export interface KernelSelectProps {
  errorText?: string;
  kernels: Kernel[];
  onChange: (selected: Item<string>) => void;
  readOnly?: boolean;
  selectedKernel?: string;
}

/**
 * This component's main purpose is to take an
 * API /kernels response, which returns a sorted but
 * undifferentiated list, and organize it into a dropdown
 * menu that makes more sense.
 */

export const KernelSelect = React.memo((props: KernelSelectProps) => {
  const { errorText, kernels, onChange, readOnly, selectedKernel } = props;

  const options = kernelsToGroupedItems(kernels);

  return (
    <Select
      disabled={Boolean(readOnly)}
      errorGroup="linode-config-drawer"
      errorText={errorText}
      isClearable={false}
      label="Select a Kernel"
      onChange={onChange}
      options={options}
      value={getSelectedKernelId(selectedKernel, options)}
    />
  );
});

export const getSelectedKernelId = (
  kernelID: string | undefined,
  options: GroupType<string>[]
) => {
  if (!kernelID) {
    return null;
  }
  const kernels = options.reduce(
    (accum, thisGroup) => [...accum, ...thisGroup.options],
    []
  );
  return kernels.find((thisKernel) => kernelID === thisKernel.value);
};

export const groupKernels = (kernel: Kernel) => {
  if (kernel.label.match(/latest/i)) {
    return 'Current';
  }
  if (['GRUB (Legacy)', 'GRUB 2'].includes(kernel.label)) {
    return 'Current';
  }
  if (kernel.label === 'Direct Disk') {
    return 'Current';
  }
  if (kernel.deprecated) {
    return 'Deprecated';
  }
  if (kernel.architecture === 'x86_64') {
    return '64 bit';
  } else if (kernel.architecture === 'i386') {
    return '32 bit';
  }
  // Fallback; this should never happen.
  return 'Current';
};

export const kernelsToGroupedItems = (kernels: Kernel[]) => {
  const groupedKernels = groupBy(groupKernels, kernels);
  groupedKernels.Current = sortCurrentKernels(groupedKernels.Current);

  return Object.keys(groupedKernels)
    .reduce((accum: GroupType<string>[], thisGroup) => {
      const group = groupedKernels[thisGroup];
      if (!group || group.length === 0) {
        return accum;
      }
      return [
        ...accum,
        {
          label: thisGroup,
          options: groupedKernels[thisGroup].map((thisKernel) => ({
            label: thisKernel.label,
            value: thisKernel.id,
          })),
        },
      ];
    }, [])
    .sort(sortKernelGroups);
};

const PRIORITY = {
  '32 bit': 2,
  '64 bit': 3,
  Current: 4,
  Deprecated: 1,
};

const sortKernelGroups = (a: GroupType, b: GroupType) => {
  if (PRIORITY[a.label] > PRIORITY[b.label]) {
    return -1;
  }
  if (PRIORITY[a.label] < PRIORITY[b.label]) {
    return 1;
  }
  return 0;
};

/**
 * This is totally hard-coded and not ideal,
 * but adding a display ordinal to the kernel
 * envelope was judged to be outside of normal
 * API patterns.
 *
 * The idea is that the details of the kernel named e.g. "Latest 64 bit"
 * will change, but these five labels will always be present.
 * If someday this assumption breaks, we filter out any
 * missed matches as a failsafe.
 */
export const sortCurrentKernels = (kernels: Kernel[] = []) => {
  return [
    kernels.find((thisKernel) => thisKernel.label.match(/64 bit/i)),
    kernels.find((thisKernel) => thisKernel.label.match(/32 bit/i)),
    kernels.find((thisKernel) => thisKernel.label.match(/direct disk/i)),
    kernels.find((thisKernel) => thisKernel.label.match(/grub 2/i)),
    kernels.find((thisKernel) => thisKernel.label.match(/grub \(legacy\)/i)),
  ].filter(Boolean) as Kernel[];
};
