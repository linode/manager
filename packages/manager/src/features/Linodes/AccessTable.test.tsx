import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT } from 'src/features/Linodes/PublicIpsUnassignedTooltip';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessTable } from './AccessTable';

const linode = linodeFactory.build();

describe('AccessTable', () => {
  it('should disable copy button and display help icon tooltip if isVPCOnlyLinode is true', async () => {
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
    const copyButtons = buttons.slice(1);

    fireEvent.mouseEnter(helpIconButton);

    const publicIpsUnassignedTooltip = await findByRole(/tooltip/);
    expect(publicIpsUnassignedTooltip).toContainHTML(
      PUBLIC_IPS_UNASSIGNED_TOOLTIP_TEXT
    );

    copyButtons.forEach((copyButton) => {
      expect(copyButton).toBeDisabled();
    });
  });

  it('should not disable copy button if isVPCOnlyLinode is false', () => {
    const { getAllByRole } = renderWithTheme(
      <AccessTable
        gridSize={{ lg: 6, xs: 12 }}
        isVPCOnlyLinode={false}
        rows={[{ text: linode.ipv4[0] }, { text: linode.ipv4[1] }]}
        title={'Public IP Addresses'}
      />
    );

    const copyButtons = getAllByRole('button');

    copyButtons.forEach((copyButton) => {
      expect(copyButton).not.toBeDisabled();
    });
  });
});
