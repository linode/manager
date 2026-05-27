import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';

import { ROLES_LEARN_MORE_LINK } from '../constants';
import { EntitiesSelect } from '../Entities/EntitiesSelect';
import { Link } from '../Link/Link';
import { Paper } from '../Paper/Paper';
import { Permissions } from '../Permissions/Permissions';
import { type ExtendedRole, getFacadeRoleDescription } from '../utilities';
import {
  StyledDescription,
  StyledEntityBox,
  StyledTitle,
} from './AssignedPermissionsPanel.style';

import type { DrawerModes, EntitiesOption, ExtendedRoleView } from '../types';

interface Props {
  errorText?: string;
  hideDetails?: boolean;
  mode?: DrawerModes;
  onChange?: (value: EntitiesOption[]) => void;
  role: ExtendedRole | ExtendedRoleView;
  showName?: boolean;
  sx?: React.CSSProperties;
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
  return (
    <Paper
      marginTop={Spacing.S8}
      padding={Spacing.S12}
      sx={{
        ...sx,
        backgroundColor: `var(--token-alias-background-neutral, light-dark(#f7f7fa, #343438))`,
      }}
    >
      {hideDetails && showName && (
        <StyledTitle showName={showName}>{role.name}</StyledTitle>
      )}
      {!hideDetails && (
        <>
          <StyledTitle>
            {showName && role.name ? role.name : 'Description'}
          </StyledTitle>
          <StyledDescription>
            {role.permissions.length ? (
              role.description
            ) : (
              <>
                {getFacadeRoleDescription(role)}{' '}
                <Link to={ROLES_LEARN_MORE_LINK}>Learn more</Link>.
              </>
            )}
          </StyledDescription>
          <Permissions permissions={role.permissions} />
        </>
      )}
      {mode !== 'change-role-for-entity' && (
        <StyledEntityBox hideDetails={hideDetails}>
          <EntitiesSelect
            access={role.access}
            errorText={errorText}
            mode={mode}
            onChange={(value) => onChange?.(value)}
            type={role.entity_type}
            value={value || []}
          />
        </StyledEntityBox>
      )}
    </Paper>
  );
};
