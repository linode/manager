import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import ActionsPanel from './ActionsPanel';

describe('ActionsPanel', () => {
  const primaryButtonTestId = 'primary-button';
  const secondaryButtonTestId = 'secondary-button';
  it('should render without errors', () => {
    renderWithTheme(<ActionsPanel />);
  });

  it('should render primary button when showPrimary prop is true', () => {
    renderWithTheme(
      <ActionsPanel
        primaryButtonProps={{ 'data-testid': primaryButtonTestId }}
        showPrimary
      />
    );
    expect(screen.getByTestId(primaryButtonTestId)).toBeInTheDocument();
  });

  it('should not render primary button when showPrimary prop is false', () => {
    renderWithTheme(
      <ActionsPanel
        primaryButtonProps={{ 'data-testid': primaryButtonTestId }}
        showPrimary={false}
      />
    );
    expect(screen.queryByTestId(primaryButtonTestId)).not.toBeInTheDocument();
  });

  it('should render secondary button when showSecondary prop is true', () => {
    renderWithTheme(
      <ActionsPanel
        secondaryButtonProps={{ 'data-testid': secondaryButtonTestId }}
        showSecondary
      />
    );
    expect(screen.getByTestId(secondaryButtonTestId)).toBeInTheDocument();
  });

  it('should not render secondary button when showSecondary prop is false', () => {
    renderWithTheme(
      <ActionsPanel
        secondaryButtonProps={{ 'data-testid': secondaryButtonTestId }}
        showSecondary={false}
      />
    );
    expect(screen.queryByTestId(secondaryButtonTestId)).not.toBeInTheDocument();
  });

  it('should call primaryButtonHandler when primary button is clicked', () => {
    const mockHandler = jest.fn();
    renderWithTheme(
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': primaryButtonTestId,
          onClick: mockHandler,
        }}
        showPrimary
      />
    );
    userEvent.click(screen.getByTestId(primaryButtonTestId));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should call secondaryButtonHandler when secondary button is clicked', () => {
    const mockHandler = jest.fn();
    renderWithTheme(
      <ActionsPanel
        secondaryButtonProps={{
          'data-testid': secondaryButtonTestId,
          onClick: mockHandler,
        }}
        showSecondary
      />
    );
    userEvent.click(screen.getByTestId(secondaryButtonTestId));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
