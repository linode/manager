import * as React from 'react';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';
import { DomainActionMenu } from './DomainActionMenu';
import { domainFactory } from 'src/factories/domain';

const props = {
  onClone: jest.fn(),
  onRemove: jest.fn(),
  onEdit: jest.fn(),
  onDisableOrEnable: jest.fn(),
};

describe('Domain action menu', () => {
  it('should include basic Domain actions', () => {
    const { queryByText } = renderWithTheme(
      <DomainActionMenu domain={domainFactory.build()} {...props} />
    );
    includesActions(['Edit', 'Clone', 'Delete'], queryByText);
  });
});
