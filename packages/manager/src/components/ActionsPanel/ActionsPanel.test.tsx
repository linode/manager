import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ActionsPanel } from './ActionsPanel';

describe('ActionsPanel', () => {
  const primaryButtonTestId = 'primary-button';
  const secondaryButtonTestId = 'secondary-button';
  it('should render without errors', () => {
    renderWithTheme(<ActionsPanel />);
  });

  it('should render render primary button when primaryButtonProps are passed', () => {
    renderWithTheme(
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': primaryButtonTestId,
          label: 'Submit',
        }}
      />
    );
    expect(screen.getByTestId(primaryButtonTestId)).toBeInTheDocument();
  });

  it('should not render primary button when primaryButtonProps are not passed', () => {
    renderWithTheme(<ActionsPanel primaryButtonProps={undefined} />);
    expect(screen.queryByTestId(primaryButtonTestId)).not.toBeInTheDocument();
  });

  it('should render secondary button when secondaryButtonProps are passed', () => {
    renderWithTheme(
      <ActionsPanel
        secondaryButtonProps={{
          'data-testid': secondaryButtonTestId,
          label: 'Cancel',
        }}
      />
    );
    expect(screen.getByTestId(secondaryButtonTestId)).toBeInTheDocument();
  });

  it('should not render secondary button when secondaryButtonProps are not passed', () => {
    renderWithTheme(<ActionsPanel secondaryButtonProps={undefined} />);
    expect(screen.queryByTestId(secondaryButtonTestId)).not.toBeInTheDocument();
  });

  it('should call primaryButtonHandler when primary button is clicked', async () => {
    const mockHandler = vi.fn();
    renderWithTheme(
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': primaryButtonTestId,
          label: 'Submit',
          onClick: mockHandler,
        }}
      />
    );
    await userEvent.click(screen.getByTestId(primaryButtonTestId));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should call secondaryButtonHandler when secondary button is clicked', async () => {
    const mockHandler = vi.fn();
    renderWithTheme(
      <ActionsPanel
        secondaryButtonProps={{
          'data-testid': secondaryButtonTestId,
          label: 'Cancel',
          onClick: mockHandler,
        }}
      />
    );
    await userEvent.click(screen.getByTestId(secondaryButtonTestId));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
