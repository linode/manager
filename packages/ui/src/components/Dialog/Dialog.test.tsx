import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { Dialog } from './Dialog';

import type { DialogProps } from './Dialog';

describe('Dialog', () => {
  const defaultArgs: DialogProps = {
    onClose: vi.fn(),
    open: false,
    title: 'This is a Dialog',
  };

  it.each([
    ['not render', false],
    ['render', true],
  ])('should %s a Dialog with title when open is %s', (_, isOpen) => {
    const { queryByTestId, queryByText } = renderWithTheme(
      <Dialog {...defaultArgs} open={isOpen} />
    );

    const title = queryByText('This is a Dialog');
    const dialog = queryByTestId('drawer');

    if (isOpen) {
      expect(title).toBeInTheDocument();
      expect(dialog).toBeInTheDocument();
    } else {
      expect(title).not.toBeInTheDocument();
      expect(dialog).not.toBeInTheDocument();
    }
  });

  it('should render a Dialog with children if provided', () => {
    const { getByText } = renderWithTheme(
      <Dialog {...defaultArgs} open={true}>
        <p>Child items can go here!</p>
      </Dialog>
    );

    expect(getByText('Child items can go here!')).toBeInTheDocument();
  });

  it('should render a Dialog with subtitle if provided', () => {
    const { getByText } = renderWithTheme(
      <Dialog {...defaultArgs} open={true} subtitle="This is a subtitle" />
    );

    expect(getByText('This is a subtitle')).toBeInTheDocument();
  });

  it('should call onClose when the Dialog close button is clicked', () => {
    const { getByRole } = renderWithTheme(
      <Dialog {...defaultArgs} open={true} />
    );

    const closeButton = getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(defaultArgs.onClose).toHaveBeenCalled();
  });

  it('should render a Dialog with an error message if provided', () => {
    const { getByText } = renderWithTheme(
      <Dialog
        {...defaultArgs}
        error="Error that will be shown in the dialog."
        open={true}
      />
    );

    expect(getByText('Error that will be shown in the dialog.')).toBeVisible();
  });
});
