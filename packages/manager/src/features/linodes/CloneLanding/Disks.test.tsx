import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { extDisk3, swapDisk } from 'src/__data__/disks';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { Disks, Props } from './Disks';

afterEach(cleanup);

const disks = [extDisk3, swapDisk];

const mockHandleSelect = jest.fn();

const props: Props = {
  disks,
  diskSelection: {
    18795181: { isSelected: false, associatedConfigIds: [] },
    19040624: { isSelected: false, associatedConfigIds: [9859511] }
  },
  selectedConfigIds: [],
  handleSelect: (id: number) => mockHandleSelect(id)
};

describe('Disks', () => {
  it('renders a row for each disk', () => {
    const { getByText } = render(wrapWithTheme(<Disks {...props} />));
    disks.forEach(eachDisk => {
      expect(getByText(eachDisk.label)).toBeDefined();
    });
  });

  it('fires the handle event when clicked', () => {
    const { getByTestId } = render(wrapWithTheme(<Disks {...props} />));
    disks.forEach(eachDisk => {
      const checkbox = getByTestId(`checkbox-${eachDisk.id}`).parentNode;
      fireEvent.click(checkbox as any);
      expect(mockHandleSelect).toHaveBeenCalledWith(eachDisk.id);
    });
  });

  it('renders an empty state when no configs', () => {
    const { getByText, getByTestId } = render(
      wrapWithTheme(<Disks {...props} disks={[]} />)
    );
    expect(getByTestId('table-row-empty')).toBeDefined();
    expect(getByText('No items to display.')).toBeDefined();
  });

  it('checks the disk if the associated config is selected', () => {
    const { getByTestId } = render(
      wrapWithTheme(<Disks {...props} selectedConfigIds={[9859511]} />)
    );
    const checkbox: any = getByTestId(`checkbox-19040624`).lastElementChild;
    expect(checkbox.children[0]).toHaveAttribute('checked');
  });
});
