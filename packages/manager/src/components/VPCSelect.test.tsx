import userEvent from '@testing-library/user-event';
import React from 'react';

import { vpcFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { VPCSelect } from './VPCSelect';

describe('VPCSelect', () => {
  it('should render a label', () => {
    const { getByLabelText } = renderWithTheme(<VPCSelect value={undefined} />);

    expect(getByLabelText('VPC')).toBeVisible();
  });

  it('should render VPCs returned by the API', async () => {
    const vpcs = vpcFactory.buildList(5);

    server.use(
      http.get('*/v4beta/vpcs', () => {
        return HttpResponse.json(makeResourcePage(vpcs));
      })
    );

    const { getByPlaceholderText, getByText } = renderWithTheme(
      <VPCSelect value={null} />
    );

    await userEvent.click(getByPlaceholderText('Select an option'));

    for (const vpc of vpcs) {
      expect(getByText(vpc.label)).toBeVisible();
    }
  });
});
