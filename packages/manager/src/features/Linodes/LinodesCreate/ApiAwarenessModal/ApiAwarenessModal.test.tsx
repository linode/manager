import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ApiAwarenessModal, ApiAwarenessModalProps } from './ApiAwarenessModal';

const defaultProps: ApiAwarenessModalProps = {
  isOpen: false,
  onClose: jest.fn(),
  payLoad: {},
  route: '',
};

const renderComponent = (overrideProps?: Partial<ApiAwarenessModalProps>) => {
  const props = {
    ...defaultProps,
    ...overrideProps,
  };
  return renderWithTheme(<ApiAwarenessModal {...props} />);
};

describe('ApiAwarenessModal', () => {
  it('Should not render ApiAwarenessModal componet', () => {
    renderComponent();
    expect(screen.queryByText('Create Linode')).not.toBeInTheDocument();
  });
  it('Should render ApiAwarenessModal componet when enabled', () => {
    renderComponent({ isOpen: true });
    screen.getByText('Create Linode');
  });
  it('Should invoke onClose handler upon cliking close button', () => {
    renderComponent({ isOpen: true });
    userEvent.click(screen.getByTestId('close-button'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
