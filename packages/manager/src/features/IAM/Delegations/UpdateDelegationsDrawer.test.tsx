import { screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { UpdateDelegationsDrawer } from './UpdateDelegationsDrawer';

import type { ChildAccountWithDelegates } from '@linode/api-v4';

beforeAll(() => mockMatchMedia());

const mockChildAccountWithDelegates: ChildAccountWithDelegates = {
  company: 'Test Company',
  euuid: 'E1234567-89AB-CDEF-0123-456789ABCDEF',
  users: ['user1'],
};

const defaultProps = {
  delegation: mockChildAccountWithDelegates,
  onClose: vi.fn(),
  open: true,
};

describe('UpdateDelegationsDrawer', () => {
  it('renders the drawer with current delegates', () => {
    renderWithTheme(<UpdateDelegationsDrawer {...defaultProps} />);

    const header = screen.getByRole('heading', { name: /update delegation/i });
    expect(header).toBeInTheDocument();
    const companyName = screen.getByText(/test company/i);
    expect(companyName).toBeInTheDocument();
    const userName = screen.getByText(/user1/i);
    expect(userName).toBeInTheDocument();
  });
});
