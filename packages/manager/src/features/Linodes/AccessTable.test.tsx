import { linodeFactory } from '@linode/utilities';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT } from 'src/features/Linodes/PublicIPAddressesTooltip';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessTable } from './AccessTable';

const linode = linodeFactory.build();

describe('AccessTable', () => {
  it('should display help icon tooltip if isVPCOnlyLinode is true', async () => {
    const { findByRole, getAllByRole } = renderWithTheme(
      <AccessTable
        gridSize={{ lg: 6, xs: 12 }}
        isVPCOnlyLinode={true}
        rows={[{ text: linode.ipv4[0] }, { text: linode.ipv4[1] }]}
        title={'Public IP Addresses'}
      />
    );

    const buttons = getAllByRole('button');
    const helpIconButton = buttons[0];

    fireEvent.mouseEnter(helpIconButton);

    const publicIPAddressesTooltip = await findByRole('tooltip');
    expect(publicIPAddressesTooltip).toContainHTML(
      PUBLIC_IP_ADDRESSES_TOOLTIP_TEXT
    );
  });

  it('should not disable copy button if isVPCOnlyLinode is false', () => {
    const { getAllByRole } = renderWithTheme(
      <>
        <AccessTable
          gridSize={{ lg: 6, xs: 12 }}
          isVPCOnlyLinode={false}
          rows={[{ text: linode.ipv4[0] }, { text: linode.ipv4[1] }]}
          title={'Public IP Addresses'}
        />

        <AccessTable
          gridSize={{ lg: 6, xs: 12 }}
          isVPCOnlyLinode={false}
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

  it('should disable copy buttons for Public IP Addresses if isVPCOnlyLinode is true', () => {
    const { container } = renderWithTheme(
      <AccessTable
        gridSize={{ lg: 6, xs: 12 }}
        isVPCOnlyLinode={true}
        rows={[{ text: linode.ipv4[0] }, { text: linode.ipv4[1] }]}
        title={'Public IP Addresses'}
      />
    );

    const copyButtons = container.querySelectorAll('[data-qa-copy-btn]');

    copyButtons.forEach((copyButton) => {
      expect(copyButton).toBeDisabled();
    });
  });
});
