import userEvent from '@testing-library/user-event';
import React from 'react';

import { VLANFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { getVLANSelectFilter, VLANSelect } from './VLANSelect';

describe('VLANSelect', () => {
  it('should render a default "VLAN" label', () => {
    const { getByLabelText } = renderWithTheme(<VLANSelect value={null} />);

    expect(getByLabelText('VLAN')).toBeVisible();
  });

  it('should render default placeholder text', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <VLANSelect value={null} />
    );

    expect(getByPlaceholderText('Create or select a VLAN')).toBeVisible();
  });

  it('should render items returned by the API', async () => {
    const vlans = VLANFactory.buildList(5);

    server.use(
      http.get('*networking/vlans*', () => {
        return HttpResponse.json(makeResourcePage(vlans));
      })
    );

    const { getByPlaceholderText, getByText } = renderWithTheme(
      <VLANSelect value={null} />
    );

    await userEvent.click(getByPlaceholderText('Create or select a VLAN'));

    for (const vlan of vlans) {
      expect(getByText(vlan.label)).toBeVisible();
    }
  });

  it('should call onChange when a value is selected', async () => {
    const vlan = VLANFactory.build();
    const onChange = vi.fn();

    server.use(
      http.get('*networking/vlans*', () => {
        return HttpResponse.json(makeResourcePage([vlan]));
      })
    );

    const { getByPlaceholderText, getByText } = renderWithTheme(
      <VLANSelect onChange={onChange} value={null} />
    );

    await userEvent.click(getByPlaceholderText('Create or select a VLAN'));

    const vlanOption = getByText(vlan.label);

    expect(vlanOption).toBeVisible();

    await userEvent.click(vlanOption);

    expect(onChange).toHaveBeenCalledWith(vlan.label);
  });
});

describe('getVLANSelectFilter', () => {
  it('should handle an input value', () => {
    expect(getVLANSelectFilter({ inputValue: 'test' })).toStrictEqual({
      label: { '+contains': 'test' },
    });
  });
  it('should handle an input value with a default filter', () => {
    expect(
      getVLANSelectFilter({
        defaultFilter: { region: 'us-east' },
        inputValue: 'test',
      })
    ).toStrictEqual({
      label: { '+contains': 'test' },
      region: 'us-east',
    });
  });
});
