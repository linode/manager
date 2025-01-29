import * as React from 'react';

import { subnetFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { SubnetDeleteDialog } from './SubnetDeleteDialog';

import type { ManagerPreferences } from 'src/types/ManagerPreferences';

const props = {
  onClose: vi.fn(),
  open: true,
  subnet: subnetFactory.build({ label: 'some subnet' }),
  vpcId: 1,
};

const preference: ManagerPreferences['type_to_confirm'] = true;

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile/preferences', async () => {
  const actual = await vi.importActual('src/queries/profile/preferences');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
  };
});

queryMocks.usePreferences.mockReturnValue({
  data: preference,
});

describe('Delete Subnet dialog', () => {
  it('should render a SubnetDeleteDialog', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });

    const { getByText } = renderWithTheme(<SubnetDeleteDialog {...props} />);

    getByText('Delete Subnet some subnet');
    getByText('Subnet Label');
    getByText('Cancel');
    getByText('Delete');
  });
});
