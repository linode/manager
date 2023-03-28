import { vi } from 'vitest';
import * as React from 'react';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';
import { DomainActionMenu } from './DomainActionMenu';
import { domainFactory } from 'src/factories/domain';

const props = {
  onClone: vi.fn(),
  onRemove: vi.fn(),
  onEdit: vi.fn(),
  onDisableOrEnable: vi.fn(),
};

describe('Domain action menu', () => {
  it('should include basic Domain actions', () => {
    const { queryByText } = renderWithTheme(
      <DomainActionMenu domain={domainFactory.build()} {...props} />
    );
    includesActions(['Edit', 'Clone', 'Delete'], queryByText);
  });
});
