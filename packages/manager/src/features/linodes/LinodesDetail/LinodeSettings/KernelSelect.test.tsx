import { Kernel } from '@linode/api-v4/lib/linodes/types';
import { screen } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import KernelSelect, { kernelsToGroupedItems, Props } from './KernelSelect';

const cachedKernelRequest = require('src/cachedData/kernels.json');

const kernels = cachedKernelRequest.data.filter(
  (thisKernel: Kernel) => thisKernel.kvm
);

const props: Props = {
  kernels,
  onChange: jest.fn()
};

jest.mock('src/components/EnhancedSelect/Select');

describe('Kernel Select component', () => {
  it('should render a select with the correct number of options', () => {
    renderWithTheme(<KernelSelect {...props} />);
    expect(screen.getAllByTestId('mock-option')).toHaveLength(kernels.length);
  });

  it('should group kernels correctly', () => {
    const groupedKernels = kernelsToGroupedItems(kernels);
    const current = groupedKernels[0];
    expect(current.options.map((k: any) => k.value)).toEqual([
      'linode/latest-64bit',
      'linode/latest-32bit',
      'linode/direct-disk',
      'linode/grub2',
      'linode/grub-legacy'
    ]);
  });
});
