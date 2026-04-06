import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessTable } from './AccessTable';
import { PUBLIC_IP_ADDRESSES_CONFIG_INTERFACE_TOOLTIP_TEXT } from './constants';

const linode = linodeFactory.build();

describe('AccessTable', () => {
  it('should display help icon tooltip for each disabled row', async () => {
    const { findByRole, findAllByTestId } = renderWithTheme(
      <AccessTable
        gridSize={{ lg: 6, xs: 12 }}
        rows={[
          { text: linode.ipv4[0], disabled: true },
          { text: linode.ipv4[1], disabled: true },
        ]}
        title={'Public IP Addresses'}
      />
    );

    // two tooltip buttons should appear
    const tooltips = await findAllByTestId('tooltip-info-icon');
    expect(tooltips).toHaveLength(2);

    await userEvent.click(tooltips[0]);
    const publicIPAddressesTooltip = await findByRole('tooltip');
    expect(publicIPAddressesTooltip).toContainHTML(
      PUBLIC_IP_ADDRESSES_CONFIG_INTERFACE_TOOLTIP_TEXT
    );
  });

  it('should not disable copy button if isVPCOnlyLinode is false', () => {
    const { getAllByRole } = renderWithTheme(
      <>
        <AccessTable
          gridSize={{ lg: 6, xs: 12 }}
          rows={[{ text: linode.ipv4[0] }, { text: linode.ipv4[1] }]}
          title={'Public IP Addresses'}
        />

        <AccessTable
          gridSize={{ lg: 6, xs: 12 }}
          rows={[{ text: linode.ipv4[0] }, { text: linode.ipv4[1] }]}
          title={'Access'}
        />
      </>
    );

    const copyButtons = getAllByRole('button');

    copyButtons.forEach((copyButton) => {
      expect(copyButton).not.toBeDisabled();
    });
  });

  it('should disable copy buttons for Public IP Addresses if those rows are disabled', () => {
    const { container } = renderWithTheme(
      <AccessTable
        gridSize={{ lg: 6, xs: 12 }}
        rows={[
          { text: linode.ipv4[0], disabled: true },
          { text: linode.ipv4[1], disabled: true },
        ]}
        title={'Public IP Addresses'}
      />
    );

    const copyButtons = container.querySelectorAll('[data-qa-copy-btn]');

    copyButtons.forEach((copyButton) => {
      expect(copyButton).toBeDisabled();
    });
  });
});
