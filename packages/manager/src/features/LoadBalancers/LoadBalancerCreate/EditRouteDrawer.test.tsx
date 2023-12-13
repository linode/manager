import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { EditRouteDrawer } from './EditRouteDrawer';
import {
  LoadBalancerCreateFormData,
  initialValues,
} from './LoadBalancerCreate';

describe('EditRouteDrawer (AGLB full create flow)', () => {
  it('renders a title', () => {
    const { getByText } = renderWithThemeAndFormik(
      <EditRouteDrawer
        configurationIndex={0}
        onClose={vi.fn()}
        open={true}
        routeIndex={0}
      />,
      { initialValues, onSubmit: vi.fn() }
    );

    expect(getByText('Edit Route', { selector: 'h2' })).toBeVisible();
  });
  it('prefills the label field with the route label and edits', async () => {
    const values: LoadBalancerCreateFormData = {
      ...initialValues,
      configurations: [
        {
          service_targets: [],
          certificates: [],
          label: 'test',
          port: 8080,
          protocol: 'http',
          routes: [{ label: 'test-1', protocol: 'http', rules: [] }],
        },
      ],
    };

    const {
      getByLabelText,
      getByText,
    } = renderWithThemeAndFormik(
      <EditRouteDrawer
        configurationIndex={0}
        onClose={vi.fn()}
        open={true}
        routeIndex={0}
      />,
      { initialValues: values, onSubmit: vi.fn() }
    );

    const routeLabelTextField = getByLabelText('Route Label');
    const saveButton = getByText('Save').closest('button');

    expect(routeLabelTextField).toHaveDisplayValue(
      values.configurations![0].routes![0].label
    );

    expect(saveButton).toBeDisabled();

    userEvent.type(routeLabelTextField, 'my-new-label');

    expect(saveButton).toBeEnabled();

    userEvent.click(saveButton!);
  });
});
