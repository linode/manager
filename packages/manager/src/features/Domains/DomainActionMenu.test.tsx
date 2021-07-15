import { DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { DomainActionMenu } from './DomainActionMenu';

const props = {
  onClone: jest.fn(),
  onRemove: jest.fn(),
  onEdit: jest.fn(),
  type: 'master' as 'master' | 'slave',
  domain: '',
  id: 1234456,
  onDisableOrEnable: jest.fn(),
  status: 'active' as DomainStatus,
  ...reactRouterProps,
};

describe('Domain action menu', () => {
  it('should include basic Domain actions', () => {
    const { queryByText } = renderWithTheme(<DomainActionMenu {...props} />);
    includesActions(['Edit', 'Clone', 'Delete'], queryByText);
  });
});
