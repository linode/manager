import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import {
  LoadBalancerCreateFormData,
  initialValues,
} from '../../../LoadBalancerCreateFormWrapper';
import { EditRouteDrawer } from './EditRouteDrawer';

describe('EditRouteDrawer', () => {
  test('Should render EditRouteDrawer', () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <EditRouteDrawer
        configIndex={0}
        onClose={vi.fn()}
        open={true}
        routeIndex={0}
      />,
      {
        initialValues,
        onSubmit: vi.fn(),
      }
    );
    expect(
      screen.getByRole('dialog', { name: 'Edit Route' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Route Label' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Close drawer' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save Changes' })
    ).toBeInTheDocument();
  });
  test('Should edit and save Route  Label', async () => {
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <EditRouteDrawer
        configIndex={0}
        onClose={vi.fn()}
        open={true}
        routeIndex={0}
      />,
      {
        initialValues: {
          ...initialValues,
          configurations: [
            {
              certificates: [],
              label: 'test',
              port: 8080,
              protocol: 'http',
              routes: [{ label: 'route-label', protocol: 'http', rules: [] }],
              service_targets: [],
            },
          ],
        },
        onSubmit: vi.fn(),
      }
    );

    const routeLabelFiled = screen.getByRole('textbox', {
      name: 'Route Label',
    });

    expect(routeLabelFiled).toHaveDisplayValue('route-label');

    userEvent.type(routeLabelFiled, 'rote-new-label');

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  });

  test('Should call onClose when close button is clicked', async () => {
    const onCloseMock = vi.fn();
    renderWithThemeAndFormik<LoadBalancerCreateFormData>(
      <EditRouteDrawer
        configIndex={0}
        onClose={onCloseMock}
        open={true}
        routeIndex={0}
      />,
      {
        initialValues,
        onSubmit: vi.fn(),
      }
    );

    const closeButton = screen.getByRole('button', { name: 'Close drawer' });
    await userEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
