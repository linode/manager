import * as React from 'react';

import { domainFactory } from 'src/factories/domain';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

import { DomainActionMenu } from './DomainActionMenu';

const props = {
  onClone: jest.fn(),
  onDisableOrEnable: jest.fn(),
  onEdit: jest.fn(),
  onRemove: jest.fn(),
};

describe('Domain action menu', () => {
  it('should include basic Domain actions', () => {
    const { queryByText } = renderWithTheme(
      <DomainActionMenu domain={domainFactory.build()} {...props} />
    );
    includesActions(['Edit', 'Clone', 'Delete'], queryByText);
  });
});
