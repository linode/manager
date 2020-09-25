import * as request from '@linode/api-v4/lib/vlans/vlans';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import CreateVLANDialog from './CreateVLANDialog';
import { vlanContext } from './CreateVLANContext';

const Provider = vlanContext.Provider;

const open = jest.fn();
const close = jest.fn();

const spy = jest.spyOn<any, any>(request, 'createVlan');

const renderComponent = () =>
  renderWithTheme(
    <Provider value={{ isOpen: true, open, close }}>
      <CreateVLANDialog />
    </Provider>
  );

describe('Create VLAN dialog', () => {
  it('should render a dialog with a title', () => {
    renderComponent();
    expect(screen.getByText(/create a virtual lan/i)).toBeInTheDocument();
  });

  it('should close the dialog on submit', async () => {
    renderComponent();
    userEvent.click(screen.getByTestId('submit-vlan-form'));
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
  });
});
