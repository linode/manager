import { Kernel } from '@linode/api-v4/lib/linodes/types';
import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  KernelSelect,
  KernelSelectProps,
  kernelsToGroupedItems,
  sortCurrentKernels,
} from './KernelSelect';

let kernels: Kernel[] = [];
beforeAll(async () => {
  const cachedKernelData = await vi.importActual<any>(
    'src/cachedData/kernels.json'
  );
  kernels = (cachedKernelData['data'] || []).filter(
    (kernel: Kernel) => !!kernel.kvm
  );
});

vi.mock('src/components/EnhancedSelect/Select');

describe('Kernel Select component', () => {
  it('should render a select with the correct number of options', () => {
    const props: KernelSelectProps = {
      kernels,
      onChange: vi.fn(),
    };
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
      'linode/grub-legacy',
    ]);
  });

  describe('kernel sort method', () => {
    it('should return kernels in the correct order', () => {
      const sortedKernels = sortCurrentKernels(kernels);
      expect(sortedKernels).toHaveLength(5);
      expect(sortedKernels[0].id).toMatch(/linode\/latest-64bit/);
    });

    it('should handle bad input', () => {
      expect(sortCurrentKernels(undefined as any)).toEqual([]);
    });
  });
});
