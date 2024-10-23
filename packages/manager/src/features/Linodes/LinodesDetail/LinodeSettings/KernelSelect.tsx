import { groupBy } from 'ramda';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import type { Kernel } from '@linode/api-v4';

export interface KernelSelectProps {
  errorText?: string;
  kernels: Kernel[];
  onChange: (selectedValue: string) => void;
  readOnly?: boolean;
  selectedKernel?: string;
}

export type KernelType = '32 bit' | '64 bit' | 'Current' | 'Deprecated';

export interface KernelOption {
  kernelType: KernelType;
  label: string;
  value: string;
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
    <Autocomplete
      renderOption={(props, kernel) => {
        const { key, ...rest } = props;
        return (
          <li {...rest} data-testid="kernel-option" key={key}>
            {kernel.label}
          </li>
        );
      }}
      textFieldProps={{
        errorGroup: 'linode-config-drawer',
      }}
      autoHighlight
      disableClearable
      disabled={readOnly}
      errorText={errorText}
      groupBy={(option) => option.kernelType}
      label="Select a Kernel"
      onChange={(_, selected) => onChange(selected.value)}
      options={options}
      placeholder="Select a Kernel"
      value={getSelectedKernelId(selectedKernel, options)}
    />
  );
});

export const getSelectedKernelId = (
  kernelID: string | undefined,
  options: KernelOption[]
) => {
  if (!kernelID) {
    return;
  }
  return options.find((option) => kernelID === option.value);
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
    .reduce((accum: KernelOption[], thisGroup: KernelType) => {
      const group = groupedKernels[thisGroup];
      if (!group || group.length === 0) {
        return accum;
      }
      return [
        ...accum,
        ...group.map((thisKernel) => ({
          kernelType: thisGroup,
          label: thisKernel.label,
          value: thisKernel.id,
        })),
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

const sortKernelGroups = (a: KernelOption, b: KernelOption) => {
  if (PRIORITY[a.kernelType] > PRIORITY[b.kernelType]) {
    return -1;
  }
  if (PRIORITY[a.kernelType] < PRIORITY[b.kernelType]) {
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
