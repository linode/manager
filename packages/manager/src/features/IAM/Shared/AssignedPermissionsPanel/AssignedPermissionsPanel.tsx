import { Spacing, Typography } from '@akamai/cds-tokens';
import * as React from 'react';

import styles from '../../Shared/global.module.css';
import { ROLES_LEARN_MORE_LINK } from '../constants';
import { EntitiesSelect } from '../Entities/EntitiesSelect';
import { Link } from '../Link/Link';
import { Paper } from '../Paper/Paper';
import { Permissions } from '../Permissions/Permissions';
import { type ExtendedRole, getFacadeRoleDescription } from '../utilities';

import type { DrawerModes, EntitiesOption, ExtendedRoleView } from '../types';

interface Props {
  errorText?: string;
  hideDetails?: boolean;
  mode?: DrawerModes;
  onChange?: (value: EntitiesOption[]) => void;
  role: ExtendedRole | ExtendedRoleView | undefined;
  showName?: boolean;
  style?: React.CSSProperties;
  value?: EntitiesOption[];
}

export const AssignedPermissionsPanel = ({
  errorText,
  hideDetails,
  mode,
  onChange,
  role,
  showName,
  style,
  value,
}: Props) => {
  if (!role) {
    return null;
  }

  return (
    <Paper
      className={styles.noMargin}
      marginTop={Spacing.S8}
      padding={Spacing.S12}
      style={{
        ...style,
        backgroundColor: `var(--token-alias-background-neutral, light-dark(#f7f7fa, #343438))`,
      }}
    >
      {hideDetails && showName && (
        <p
          style={{
            font: Typography.Label.Bold.S,
            marginBottom: showName ? Spacing.S12 : undefined,
          }}
        >
          {role.name}
        </p>
      )}
      {!hideDetails && (
        <>
          <p
            style={{
              font: Typography.Label.Bold.S,
            }}
          >
            {showName && role.name ? role.name : 'Description'}
          </p>
          <p
            style={{
              marginBottom: Spacing.S12,
              marginTop: Spacing.S8,
              overflowWrap: 'anywhere',
              wordBreak: 'normal',
            }}
          >
            {role.permissions.length ? (
              role.description
            ) : (
              <>
                {getFacadeRoleDescription(role)}{' '}
                <Link to={ROLES_LEARN_MORE_LINK}>Learn more</Link>.
              </>
            )}
          </p>
          <Permissions permissions={role.permissions} />
        </>
      )}
      {mode !== 'change-role-for-entity' && (
        <div style={{ marginTop: !hideDetails ? Spacing.S16 : undefined }}>
          <EntitiesSelect
            access={role.access}
            errorText={errorText}
            mode={mode}
            onChange={(value) => onChange?.(value)}
            type={role.entity_type}
            value={value || []}
          />
        </div>
      )}
    </Paper>
  );
};
