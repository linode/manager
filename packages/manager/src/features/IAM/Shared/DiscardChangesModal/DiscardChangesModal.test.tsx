import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  getCdsButtonByText,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { DiscardChangesModal } from './DiscardChangesModal';

const mocks = vi.hoisted(() => ({
  useBreakpoint: vi.fn(),
}));

vi.mock('../../hooks/useBreakpoint', () => ({
  useBreakpoint: mocks.useBreakpoint,
}));

const renderComponent = (
  props: Partial<React.ComponentProps<typeof DiscardChangesModal>> = {}
) => {
  return renderWithProviders(
    <DiscardChangesModal
      onClose={vi.fn()}
      onDiscard={vi.fn()}
      open={true}
      {...props}
    />
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useBreakpoint.mockReturnValue(true);
});

describe('DiscardChangesModal', () => {
  it('renders the discard warning copy when open', () => {
    const { container } = renderComponent();

    expect(container.querySelector('cds-modal')).toBeTruthy();
    expect(screen.getByText('Discard changes?')).toBeVisible();
    expect(screen.getByText(/your changes will be discarded/i)).toBeVisible();
  });

  it('calls onDiscard when Discard Changes is clicked', async () => {
    const onDiscard = vi.fn();
    const { container } = renderComponent({ onDiscard });

    const discardButton = await getCdsButtonByText(
      container,
      'Discard Changes'
    );

    expect(discardButton).toBeTruthy();
    await userEvent.click(discardButton as HTMLButtonElement);

    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Go Back And Review Changes is clicked', async () => {
    const onClose = vi.fn();
    const { container } = renderComponent({ onClose });

    const reviewButton = await getCdsButtonByText(
      container,
      'Go Back And Review Changes'
    );

    expect(reviewButton).toBeTruthy();
    await userEvent.click(reviewButton as HTMLButtonElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses full width on small screens', () => {
    mocks.useBreakpoint.mockReturnValue(false);

    const { container } = renderComponent();
    const modal = container.querySelector('cds-modal');

    expect(modal).toHaveProperty('width', '100%');
  });
});
