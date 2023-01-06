import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithTheme } from 'src/utilities/testHelpers';

import ApiAwarenessModal, { Props } from '.';

const defaultProps: Props = {
  isOpen: false,
  onClose: jest.fn(),
};

const renderComponent = (overrideProps?: Pick<Props, 'isOpen'>) => {
  const props = {
    ...defaultProps,
    ...overrideProps,
  };
  return renderWithTheme(<ApiAwarenessModal {...props} />);
};

describe('ApiAwarenessModal', () => {
  it('Should not render ApiAwarenessModal componet', () => {
    renderComponent();
    expect(
      screen.queryByText('Create using commandline')
    ).not.toBeInTheDocument();
  });
  it('Should render ApiAwarenessModal componet when enabled', () => {
    renderComponent({ isOpen: true });
    screen.getByText('Create using commandline');
  });
  it('Should invoke onClose handler upon cliking close button', async () => {
    renderComponent({ isOpen: true });
    userEvent.click(screen.getByTestId('close-button'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
