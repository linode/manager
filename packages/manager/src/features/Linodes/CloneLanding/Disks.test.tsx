import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { extDisk3, swapDisk } from 'src/__data__/disks';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { Disks } from './Disks';

import type { DisksProps } from './Disks';

const disks = [extDisk3, swapDisk];

const mockHandleSelect = vi.fn();

const props: DisksProps = {
  diskSelection: {
    18795181: { associatedConfigIds: [], isSelected: false },
    19040624: { associatedConfigIds: [9859511], isSelected: false },
  },
  disks,
  handleSelect: (id: number) => mockHandleSelect(id),
  selectedConfigIds: [],
};

describe('Disks', () => {
  it('renders a row for each disk', () => {
    const { getByText } = render(wrapWithTheme(<Disks {...props} />));
    disks.forEach((eachDisk) => {
      expect(getByText(eachDisk.label)).toBeDefined();
    });
  });

  it('fires the handle event when clicked', () => {
    const { getByTestId } = render(wrapWithTheme(<Disks {...props} />));
    disks.forEach((eachDisk) => {
      const checkbox = getByTestId(`checkbox-${eachDisk.id}`).parentNode;
      fireEvent.click(checkbox as any);
      expect(mockHandleSelect).toHaveBeenCalledWith(eachDisk.id);
    });
  });

  it('renders an empty state when no configs', () => {
    const { getByTestId, getByText } = render(
      wrapWithTheme(<Disks {...props} disks={[]} />)
    );
    expect(getByTestId('table-row-empty')).toBeDefined();
    expect(getByText('No items to display.')).toBeDefined();
  });

  it('checks the disk if the associated config is selected', () => {
    const { getByTestId } = render(
      wrapWithTheme(<Disks {...props} selectedConfigIds={[9859511]} />)
    );
    const checkbox: any = getByTestId('checkbox-19040624').firstElementChild;
    expect(checkbox).toHaveAttribute('checked');
  });
});
