import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { domainFactory } from 'src/factories/domain';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { DomainActionMenu } from './DomainActionMenu';

const props = {
  onClone: vi.fn(),
  onDisableOrEnable: vi.fn(),
  onEdit: vi.fn(),
  onRemove: vi.fn(),
};

describe('Domain action menu', () => {
  it('should include basic Domain actions', async () => {
    const { getByText, queryByLabelText } = await renderWithThemeAndRouter(
      <DomainActionMenu domain={domainFactory.build()} {...props} />
    );

    const actionMenuButton = queryByLabelText(/^Action menu for/)!;

    await userEvent.click(actionMenuButton);

    for (const action of ['Edit', 'Clone', 'Delete']) {
      expect(getByText(action)).toBeVisible();
    }
  });
});
