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
});
