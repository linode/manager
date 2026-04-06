import { Button } from '@linode/ui';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { RemovableSelectionsList } from './RemovableSelectionsList';

const defaultList = Array.from({ length: 5 }, (_, index) => {
  const num = index + 1;
  return {
    id: num,
    label: `my-linode-${num}`,
    preferredLabel: `my-linode-preferred-${num}`,
  };
});

const diffLabelList = Array.from({ length: 5 }, (_, index) => {
  const num = index + 1;
  return {
    id: num,
    label: `my-linode-${num}`,
    preferredLabel: `my-linode-preferred-${num}`,
  };
});

const props = {
  headerText: 'Linodes to remove',
  noDataText: 'No Linodes available',
  onRemove: vi.fn(),
  selectionData: defaultList,
};

describe('Removable Selections List', () => {
  it('should render the list correctly', () => {
    const screen = renderWithTheme(<RemovableSelectionsList {...props} />);
    const header = screen.getByText('Linodes to remove');
    expect(header).toBeVisible();

    for (let i = 0; i < 5; i++) {
      const data = screen.getByText(`my-linode-${i + 1}`);
      expect(data).toBeVisible();
      const removeButton = screen.getByLabelText(`remove my-linode-${i + 1}`);
      expect(removeButton).toBeInTheDocument();
    }
  });

  it('should display the no data text if there is no data', () => {
    const screen = renderWithTheme(
      <RemovableSelectionsList {...props} selectionData={[]} />
    );
    const header = screen.getByText('Linodes to remove');
    expect(header).toBeVisible();
    const removable = screen.getByText('No Linodes available');
    expect(removable).toBeVisible();
  });

  it('should render the preferred label option if that is provided', () => {
    const screen = renderWithTheme(
      <RemovableSelectionsList
        {...props}
        preferredDataLabel="preferredLabel"
        selectionData={diffLabelList}
      />
    );
    const header = screen.getByText('Linodes to remove');
    expect(header).toBeVisible();

    for (let i = 0; i < 5; i++) {
      const data = screen.getByText(`my-linode-preferred-${i + 1}`);
      expect(data).toBeVisible();
      const removeButton = screen.getByLabelText(
        `remove my-linode-preferred-${i + 1}`
      );
      expect(removeButton).toBeInTheDocument();
    }
  });

  it('should call the onRemove function', () => {
    const screen = renderWithTheme(<RemovableSelectionsList {...props} />);
    const removeButton = screen.getByLabelText(`remove my-linode-1`);
    fireEvent.click(removeButton);
    expect(props.onRemove).toHaveBeenCalled();
  });

  it('should not display the remove button for a list item', () => {
    const screen = renderWithTheme(
      <RemovableSelectionsList {...props} isRemovable={false} />
    );
    const removeButton = screen.queryByLabelText(`remove my-linode-1`);
    expect(removeButton).not.toBeInTheDocument();
  });

  it('should render the remove button as text when removeButtonText is declared', () => {
    const { queryAllByText } = renderWithTheme(
      <RemovableSelectionsList
        {...props}
        isRemovable
        RemoveButton={() => <Button>Remove Linode</Button>}
      />
    );
    expect(queryAllByText('Remove Linode')).toHaveLength(5);
  });
});
