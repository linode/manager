import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EndpointHealth } from './EndpointHealth';

describe('EndpointHealth', () => {
  it('renders endpoints that are up and down', () => {
    const { getByText } = renderWithTheme(<EndpointHealth down={0} up={0} />);

    expect(getByText('0 up')).toBeVisible();
    expect(getByText('0 down')).toBeVisible();
  });
  it('renders endpoints that are up and down', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <EndpointHealth down={6} up={18} />,
      { theme: 'light' }
    );

    const upStatusIcon = getByLabelText('Status is active');
    const downStatusIcon = getByLabelText('Status is error');

    expect(upStatusIcon).toHaveStyle({ backgroundColor: '#17cf73' });
    expect(downStatusIcon).toHaveStyle({ backgroundColor: '#ca0813' });

    expect(getByText('18 up')).toBeVisible();
    expect(getByText('6 down')).toBeVisible();
  });
  it('should render gray when the "down" number is zero', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <EndpointHealth down={0} up={18} />
    );

    const statusIcon = getByLabelText('Status is inactive');

    expect(statusIcon).toBeVisible();
    expect(statusIcon).toHaveStyle({ backgroundColor: '#dbdde1' });
    expect(getByText('0 down')).toBeVisible();
  });
  it('should render gray when the "up" number is zero', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <EndpointHealth down={8} up={0} />
    );

    const statusIcon = getByLabelText('Status is inactive');

    expect(statusIcon).toBeVisible();
    expect(statusIcon).toHaveStyle({ backgroundColor: '#dbdde1' });
    expect(getByText('0 up')).toBeVisible();
  });
});
