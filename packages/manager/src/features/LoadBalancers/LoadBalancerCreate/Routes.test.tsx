import { RoutePayload } from '@linode/api-v4';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import {
  LoadBalancerCreateFormData,
  initialValues,
} from './LoadBalancerCreate';
import { Routes } from './Routes';

describe('Routes (AGLB full create flow)', () => {
  it('renders a title and an add button', () => {
    const { getByText } = renderWithThemeAndFormik(
      <Routes configurationIndex={0} />,
      { initialValues, onSubmit: vi.fn() }
    );

    expect(getByText('Routes')).toBeVisible();
    expect(getByText('Add Route')).toBeVisible();
  });
  it('renders routes for the given config', () => {
    const values: LoadBalancerCreateFormData = {
      ...initialValues,
      configurations: [
        {
          certificates: [],
          label: 'test',
          port: 8080,
          protocol: 'http',
          routes: [
            { label: 'test-1', protocol: 'http', rules: [] },
            { label: 'test-2', protocol: 'http', rules: [] },
            { label: 'test-3', protocol: 'http', rules: [] },
          ],
        },
      ],
    };
    const { getByText } = renderWithThemeAndFormik(
      <Routes configurationIndex={0} />,
      { initialValues: values, onSubmit: vi.fn() }
    );

    for (const route of values.configurations![0].routes!) {
      expect(getByText(route.label)).toBeVisible();
    }
  });
  it('can remove a route', () => {
    const routes: RoutePayload[] = [
      { label: 'test-1', protocol: 'http', rules: [] },
      { label: 'test-2', protocol: 'http', rules: [] },
      { label: 'test-3', protocol: 'http', rules: [] },
    ];

    const values: LoadBalancerCreateFormData = {
      ...initialValues,
      configurations: [
        {
          certificates: [],
          label: 'test',
          port: 8080,
          protocol: 'http',
          routes,
        },
      ],
    };

    const { getByLabelText, getByText, queryByText } = renderWithThemeAndFormik(
      <Routes configurationIndex={0} />,
      {
        initialValues: values,
        onSubmit: vi.fn(),
      }
    );

    const actionMenu = getByLabelText(`Action Menu for Route test-2`);
    userEvent.click(actionMenu);

    const deleteButton = getByText('Remove');
    userEvent.click(deleteButton);

    expect(queryByText('test-2')).not.toBeInTheDocument();
    expect(getByText('test-1')).toBeInTheDocument();
    expect(getByText('test-3')).toBeInTheDocument();
  });
});
