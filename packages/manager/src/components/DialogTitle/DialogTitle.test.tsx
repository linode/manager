import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DialogTitle } from './DialogTitle';

import type { DialogTitleProps } from './DialogTitle';

const mockId = '1';
const mockSubTitle = 'This a basic dialog';
const mockTitle = 'This is a Dialog';

const defaultProps: DialogTitleProps = {
  id: mockId,
  subtitle: mockSubTitle,
  title: mockTitle,
};

describe('DialogTitle', () => {
  it('should render title, subtitle and Id', () => {
    const { getByRole, getByText } = renderWithTheme(
      <DialogTitle {...defaultProps} />
    );
    expect(getByText(mockTitle)).toBeVisible();
    expect(getByText(mockSubTitle)).toBeVisible();
    const titleElement = getByRole('heading');
    expect(titleElement).toHaveAttribute('id', mockId);
  });

  it('should not render title when isFetching is true', () => {
    const { queryByText } = renderWithTheme(
      <DialogTitle isFetching {...defaultProps} />
    );
    expect(queryByText(mockTitle)).not.toBeInTheDocument();
  });

  it('should close the dialog Box when clciked on close Button', async () => {
    const onCloseMock = vi.fn();
    const { getByRole } = renderWithTheme(
      <DialogTitle
        onClose={onCloseMock({}, 'escapeKeyDown')}
        {...defaultProps}
      />
    );
    const closeButton = getByRole('button', {
      name: 'Close',
    });
    expect(closeButton).toBeInTheDocument();
    await userEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledWith({}, 'escapeKeyDown');
  });
});
