import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { AddRouteDrawer } from './AddRouteDrawer';
import { initialValues } from './LoadBalancerCreateFormWrapper';

describe('AddRouteDrawer (ACLB full create flow)', () => {
  it('renders a title', () => {
    const { getByText } = renderWithThemeAndFormik(
      <AddRouteDrawer
        configurationIndex={0}
        onClose={vi.fn()}
        open={true}
        protocol="tcp"
      />,
      { initialValues, onSubmit: vi.fn() }
    );

    expect(getByText('Add Route', { selector: 'h2' })).toBeVisible();
  });
  it('renders the options and default to creating a new route', () => {
    const { getByText } = renderWithThemeAndFormik(
      <AddRouteDrawer
        configurationIndex={0}
        onClose={vi.fn()}
        open={true}
        protocol="http"
      />,
      { initialValues, onSubmit: vi.fn() }
    );

    expect(getByText('Create New HTTP Route')).toBeVisible();
  });
  it('closes the drawer upon route creation', async () => {
    const onClose = vi.fn();
    const {
      getByLabelText,
      getByText,
    } = renderWithThemeAndFormik(
      <AddRouteDrawer
        configurationIndex={0}
        onClose={onClose}
        open={true}
        protocol="http"
      />,
      { initialValues, onSubmit: vi.fn() }
    );

    const labelTextField = getByLabelText('Route Label');
    const addButton = getByText('Add Route', { selector: 'span' }).closest(
      'button'
    );

    await userEvent.type(labelTextField, 'my-route');

    await userEvent.click(addButton!);

    await waitFor(() => expect(onClose).toBeCalled());
  });
});
