import { linodeFactory } from '@linode/utilities';
import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SelectLinodeCard } from './SelectLinodeCard';

const mockPoweredOnLinode = linodeFactory.build({ status: 'running' });
const mockPoweredOffLinode = linodeFactory.build({ status: 'offline' });

const defaultProps = {
  disabled: false,
  handlePowerOff: vi.fn(),
  handleSelection: vi.fn(),
  key: mockPoweredOnLinode.id,
  linode: mockPoweredOnLinode,
  selected: false,
  showPowerActions: false,
};

describe('SelectLinodeCard', () => {
  it('displays the status of a linode', () => {
    const { getByLabelText, getByText, queryByRole } = renderWithTheme(
      <SelectLinodeCard {...defaultProps} showPowerActions={true} />
    );
    expect(getByLabelText('Linode status running')).toBeInTheDocument();
    expect(getByText('Running')).toBeVisible();
    // Should not display the Power Off button unless the card is selected.
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays the status and Power Off button of a linode that is selected and running when power actions should be shown', () => {
    const { getByLabelText, getByRole, getByText } = renderWithTheme(
      <SelectLinodeCard
        {...defaultProps}
        selected={true}
        showPowerActions={true}
      />
    );

    expect(getByLabelText('Linode status running')).toBeInTheDocument();
    expect(getByText('Running')).toBeVisible();

    const powerOffButton = getByRole('button');
    expect(powerOffButton).toHaveTextContent('Power Off');
    fireEvent.click(powerOffButton);
    expect(defaultProps.handlePowerOff).toHaveBeenCalledTimes(1);
  });

  it('does not display the Power Off button when it should not be shown', () => {
    const { queryByRole } = renderWithTheme(
      <SelectLinodeCard
        {...defaultProps}
        selected={true}
        showPowerActions={false}
      />
    );
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not display the Power Off button when a selected linode is powered off', () => {
    const { getByLabelText, getByText, queryByRole } = renderWithTheme(
      <SelectLinodeCard
        {...defaultProps}
        linode={mockPoweredOffLinode}
        selected={true}
        showPowerActions={true}
      />
    );
    expect(getByLabelText('Linode status offline')).toBeInTheDocument();
    expect(getByText('Offline')).toBeVisible();
    // Should not display the Power Off button unless the linode is running.
    expect(queryByRole('button')).not.toBeInTheDocument();
  });
});
