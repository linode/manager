import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  NO_ASSIGNED_ENTITIES_TEXT,
  NO_ASSIGNED_ROLES_TEXT,
} from '../constants';
import { NoAssignedRoles } from './NoAssignedRoles';

const queryProps = vi.hoisted(() => ({
  useParams: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryProps.useParams,
  };
});

describe('NoAssignedRoles', () => {
  beforeEach(() => {
    queryProps.useParams.mockReturnValue({ username: 'testuser' });
  });

  it('renders with correct text for the Assigned Roles tab', async () => {
    renderWithTheme(
      <NoAssignedRoles
        hasAssignNewRoleDrawer={true}
        text={NO_ASSIGNED_ROLES_TEXT}
      />
    );
    expect(screen.getByText('This list is empty')).toBeVisible();
    expect(screen.getByText(NO_ASSIGNED_ROLES_TEXT)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Assign New Roles' })
    ).toBeVisible();
  });

  it('renders with correct text for the Assigned Entities tab', async () => {
    renderWithTheme(
      <NoAssignedRoles
        hasAssignNewRoleDrawer={false}
        text={NO_ASSIGNED_ENTITIES_TEXT}
      />
    );
    expect(screen.getByText('This list is empty')).toBeVisible();
    expect(screen.getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Assign New Roles' })
    ).not.toBeInTheDocument();
  });
});
