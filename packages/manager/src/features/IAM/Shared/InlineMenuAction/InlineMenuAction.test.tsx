import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithProviders } from '../../utilities/testHelpers';
import { InlineMenuAction } from './InlineMenuAction';

describe('InlineMenuAction', () => {
  it('renders an enabled action button', () => {
    renderWithProviders(
      <InlineMenuAction
        isActionDisabled={false}
        label="Assign Role"
        onClick={vi.fn()}
        tooltipText="You do not have permission to assign roles."
      />
    );

    const button = screen.getByText('Assign Role').closest('cds-button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('disabled');
    expect(document.querySelector('cds-tooltip')).not.toBeInTheDocument();
  });

  it('renders a disabled action with tooltip and icon', () => {
    renderWithProviders(
      <InlineMenuAction
        isActionDisabled={true}
        label="Assign Role"
        onClick={vi.fn()}
        tooltipText="You do not have permission to assign roles."
      />
    );

    const button = screen.getByText('Assign Role').closest('cds-button');
    const tooltip = document.querySelector('cds-tooltip');

    expect(button).toBeInTheDocument();
    expect(button?.querySelector('cds-icon')).toBeInTheDocument();
    expect(tooltip).toBeInTheDocument();
  });

  it('calls onClick when the action is enabled', async () => {
    const onClick = vi.fn();

    renderWithProviders(
      <InlineMenuAction
        isActionDisabled={false}
        label="Assign Role"
        onClick={onClick}
        tooltipText="You do not have permission to assign roles."
      />
    );

    const button = screen.getByText('Assign Role').closest('cds-button');
    await userEvent.click(button as HTMLElement);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
