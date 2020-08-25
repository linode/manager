import { DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { DomainActionMenu } from './DomainActionMenu';

import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

jest.mock('src/components/ActionMenu/ActionMenu');

const props = {
  onClone: jest.fn(),
  onRemove: jest.fn(),
  onEdit: jest.fn(),
  type: 'master' as 'master' | 'slave',
  domain: '',
  id: 1234456,
  onDisableOrEnable: jest.fn(),
  status: 'active' as DomainStatus,
  ...reactRouterProps
};

describe('Domain action menu', () => {
  it('should include standard Domain actions', () => {
    const { queryByText } = renderWithTheme(<DomainActionMenu {...props} />);
    includesActions(['Edit', 'Clone', 'Delete'], queryByText);
  });

  it('master Domains should include Edit DNS records action', () => {
    const { queryByText } = renderWithTheme(<DomainActionMenu {...props} />);
    includesActions(['Edit DNS Records'], queryByText);
  });

  it('slave Domains should not include Edit DNS records action', () => {
    const { queryByText } = renderWithTheme(
      <DomainActionMenu {...props} type={'slave'} />
    );
    includesActions(['Edit DNS Records'], queryByText, false);
  });
});
