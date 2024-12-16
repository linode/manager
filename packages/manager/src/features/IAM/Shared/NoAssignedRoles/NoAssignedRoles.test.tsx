import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  NO_ASSIGNED_RESOURCES_TEXT,
  NO_ASSIGNED_ROLES_TEXT,
} from '../constants';
import { NoAssignedRoles } from './NoAssignedRoles';

describe('NoAssignedRoles', () => {
  it('renders with correct text for the Assigned Roles tab', () => {
    const { getByText } = renderWithTheme(
      <NoAssignedRoles text={NO_ASSIGNED_ROLES_TEXT} />
    );
    expect(getByText(NO_ASSIGNED_ROLES_TEXT)).toBeInTheDocument();
  });

  it('renders with correct text for the Assigned Resources tab', () => {
    const { getByText } = renderWithTheme(
      <NoAssignedRoles text={NO_ASSIGNED_RESOURCES_TEXT} />
    );
    expect(getByText(NO_ASSIGNED_RESOURCES_TEXT)).toBeInTheDocument();
  });
});
