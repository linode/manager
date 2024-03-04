import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { NamespaceDeleteDialog } from './NamespaceDeleteDialogue';

describe('Namespace Delete Dialog', () => {
  const props = {
    id: 1,
    label: 'namespace-1',
    onClose: vi.fn(),
    open: true,
  };

  it('renders a Namespace delete dialog correctly', () => {
    const screen = renderWithTheme(<NamespaceDeleteDialog {...props} />);
    const namespaceTitle = screen.getByText('Delete Namespace namespace-1');
    expect(namespaceTitle).toBeVisible();

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeVisible();

    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeVisible();
  });
  it('closes the Namespace delete dialog as expected', () => {
    const screen = renderWithTheme(<NamespaceDeleteDialog {...props} />);
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeVisible();
    fireEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
});
