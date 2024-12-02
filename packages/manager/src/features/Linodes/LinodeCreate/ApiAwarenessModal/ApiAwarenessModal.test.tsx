import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { ApiAwarenessModal } from './ApiAwarenessModal';

import type { LinodeCreateFormValues } from '../utilities';
import type { ApiAwarenessModalProps } from './ApiAwarenessModal';

const defaultProps: ApiAwarenessModalProps = {
  isOpen: false,
  onClose: vi.fn(),
  payLoad: { region: '', type: '' },
};

const renderComponent = (overrideProps?: Partial<ApiAwarenessModalProps>) => {
  const props = {
    ...defaultProps,
    ...overrideProps,
  };

  return renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
    component: <ApiAwarenessModal {...props} />,
  });
};

describe('ApiAwarenessModal', () => {
  it('Should not render ApiAwarenessModal component', () => {
    renderComponent();
    expect(screen.queryByText('Create Linode')).not.toBeInTheDocument();
  });
  it('Should render ApiAwarenessModal component when enabled', () => {
    renderComponent({ isOpen: true });
    screen.getByText('Create Linode');
  });
  it('Should invoke onClose handler upon clicking close button', async () => {
    renderComponent({ isOpen: true });
    await userEvent.click(screen.getByTestId('close-button'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
