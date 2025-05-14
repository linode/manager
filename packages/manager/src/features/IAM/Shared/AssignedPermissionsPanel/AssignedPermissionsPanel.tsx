import * as React from 'react';

import { Link } from 'src/components/Link';

import { Entities } from '../Entities/Entities';
import { Permissions } from '../Permissions/Permissions';
import { type ExtendedRole, getFacadeRoleDescription } from '../utilities';
import {
  StyledDescription,
  StyledEntityBox,
  StyledPaper,
  StyledTitle,
} from './AssignedPermissionsPanel.style';

import type { DrawerModes, EntitiesOption, ExtendedRoleView } from '../types';
import type { SxProps, Theme } from '@linode/ui';

interface Props {
  errorText?: string;
  hideDetails?: boolean;
  mode?: DrawerModes;
  onChange?: (value: EntitiesOption[]) => void;
  role: ExtendedRole | ExtendedRoleView;
  showName?: boolean;
  sx?: SxProps<Theme>;
  value?: EntitiesOption[];
}

export const AssignedPermissionsPanel = ({
  errorText,
  hideDetails,
  mode,
  onChange,
  role,
  showName,
  sx,
  value,
}: Props) => {
  // TODO: update the link for the description when it's ready - UIE-8534
  return (
    <StyledPaper sx={{ ...sx }}>
      {hideDetails && showName && (
        <>
          <StyledTitle showName={showName}>{role.name}</StyledTitle>
        </>
      )}
      {!hideDetails && (
        <>
          <StyledTitle>{showName && role.name ? role.name : 'Description'}</StyledTitle>
          <StyledDescription>
            {role.permissions.length ? (
              role.description
            ) : (
              <>
                {getFacadeRoleDescription(role)} <Link to="#">Learn more.</Link>
              </>
            )}
          </StyledDescription>
          <Permissions permissions={role.permissions} />
        </>
      )}
      {mode !== 'change-role-for-entity' && (
        <StyledEntityBox hideDetails={hideDetails}>
          <Entities
            access={role.access}
            errorText={errorText}
            mode={mode}
            onChange={(value) => onChange?.(value)}
            type={role.entity_type}
            value={value || []}
          />
        </StyledEntityBox>
      )}
    </StyledPaper>
  );
};
