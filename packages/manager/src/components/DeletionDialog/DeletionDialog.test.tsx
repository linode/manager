import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DeletionDialog } from './DeletionDialog';

import type { DeletionDialogProps } from './DeletionDialog';
import type { ManagerPreferences } from '@linode/utilities';

const preference: ManagerPreferences['type_to_confirm'] = true;

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
  };
});

queryMocks.usePreferences.mockReturnValue({
  data: preference,
});

describe('DeletionDialog', () => {
  const defaultArgs: DeletionDialogProps = {
    entity: 'Linode',
    isFetching: false,
    label: 'my-linode-0',
    loading: false,
    onClose: vi.fn(),
    onDelete: vi.fn(),
    open: false,
  };

  it.each([
    ['not render', false],
    ['render', true],
  ])(
    'should %s a DeletionDialog with the correct title, close button, and action buttons when open is %s',
    (_, isOpen) => {
      const { queryByRole, queryByTestId, queryByText } = renderWithTheme(
        <DeletionDialog {...defaultArgs} open={isOpen} />
      );
      const title = queryByText(
        `Delete ${defaultArgs.entity} ${defaultArgs.label}?`
      );
      const dialog = queryByTestId('drawer');
      const closeButton = queryByRole('button', { name: 'Close' });
      const cancelButton = queryByTestId('cancel');
      const deleteButton = queryByTestId('confirm');

      if (isOpen) {
        expect(title).toBeInTheDocument();
        expect(dialog).toBeInTheDocument();
        expect(closeButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
        expect(deleteButton).toBeInTheDocument();
        expect(deleteButton).toHaveTextContent(`Delete ${defaultArgs.entity}`);
      } else {
        expect(title).not.toBeInTheDocument();
        expect(dialog).not.toBeInTheDocument();
        expect(closeButton).not.toBeInTheDocument();
        expect(cancelButton).not.toBeInTheDocument();
        expect(deleteButton).not.toBeInTheDocument();
      }
    }
  );

  it('should call onClose when the DeletionDialog close button or Action cancel button is clicked', () => {
    const { getByRole, getByTestId } = renderWithTheme(
      <DeletionDialog {...defaultArgs} open={true} />
    );

    // For close icon button
    const closeButton = getByRole('button', { name: 'Close' });
    expect(closeButton).not.toBeDisabled();
    fireEvent.click(closeButton);

    expect(defaultArgs.onClose).toHaveBeenCalled();

    // For action cancel button
    const cancelButton = getByTestId('cancel');
    expect(cancelButton).not.toBeDisabled();
    fireEvent.click(cancelButton);

    expect(defaultArgs.onClose).toHaveBeenCalled();
  });

  it('should call onDelete when the DeletionDialog delete button is clicked', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });
    const { getByTestId } = renderWithTheme(
      <DeletionDialog {...defaultArgs} open={true} />
    );

    const deleteButton = getByTestId('confirm');
    expect(deleteButton).toBeDisabled();

    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: defaultArgs.label } });

    expect(deleteButton).toBeEnabled();

    fireEvent.click(deleteButton);

    expect(defaultArgs.onDelete).toHaveBeenCalled();
  });

  it('should render a DeletionDialog with an error message if provided', () => {
    const { getByText } = renderWithTheme(
      <DeletionDialog
        {...defaultArgs}
        error="Error that will be shown in the dialog."
        open={true}
      />
    );

    expect(getByText('Error that will be shown in the dialog.')).toBeVisible();
  });

  it('should disable delete button and show loading icon if loading is true', () => {
    const { getByTestId } = renderWithTheme(
      <DeletionDialog {...defaultArgs} loading={true} open={true} />
    );

    const deleteButton = getByTestId('confirm');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();

    const loadingSvgIcon = deleteButton.querySelector('[role="progressbar"]');

    expect(loadingSvgIcon).toBeInTheDocument();
  });

  it('should display the correct warning text in the DeletionDialog', () => {
    const { getByTestId } = renderWithTheme(
      <DeletionDialog {...defaultArgs} open={true} />
    );

    const dialog = getByTestId('drawer');
    const warningText = `Warning: Deleting this ${defaultArgs.entity} is permanent and can\u2019t be undone.`;

    expect(dialog).toHaveTextContent(warningText);
  });

  it.each([
    ['not render', false],
    ['render', true],
  ])(
    'should %s input field with label when typeToConfirm is %s',
    (_, typeToConfirm) => {
      queryMocks.usePreferences.mockReturnValue({
        data: typeToConfirm,
      });

      const { queryByTestId } = renderWithTheme(
        <DeletionDialog {...defaultArgs} open={true} />
      );

      if (typeToConfirm) {
        expect(queryByTestId('inputLabelWrapper')).toBeInTheDocument();
        expect(queryByTestId('textfield-input')).toBeInTheDocument();
      } else {
        expect(queryByTestId('inputLabelWrapper')).not.toBeInTheDocument();
        expect(queryByTestId('textfield-input')).not.toBeInTheDocument();
      }
    }
  );
});
