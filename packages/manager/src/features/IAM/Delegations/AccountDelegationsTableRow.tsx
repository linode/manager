import { Button, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { Box, Typography, useTheme } from '@linode/ui';
import React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';

import { usePermissions } from '../hooks/usePermissions';
import { IAM_PARENT_USERS_PENDO_IDS } from '../Shared/constants';
import { InlineMenuAction } from '../Shared/InlineMenuAction/InlineMenuAction';
import { TruncatedList } from '../Shared/TruncatedList';
import { UpdateDelegationsDrawer } from './UpdateDelegationsDrawer';

import type { ChildAccount, ChildAccountWithDelegates } from '@linode/api-v4';

interface Props {
  delegation: ChildAccount | ChildAccountWithDelegates;
  index: number;
}

export const AccountDelegationsTableRow = ({ delegation, index }: Props) => {
  const theme = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const { data: permissions } = usePermissions('account', [
    'update_delegate_users',
  ]);
  const handleUpdateDelegations = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <TableRow
      data-qa-table-row={delegation.euuid}
      key={`delegation-${delegation.euuid}-${index}`}
    >
      <TableCell>
        <Typography
          sx={{
            maxWidth: 272,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          variant="body1"
        >
          {delegation.company}
        </Typography>
      </TableCell>
      <TableCell
        sx={(theme) => ({
          display: { sm: 'table-cell', xs: 'none' },
          padding: theme.tokens.spacing.S8,
        })}
      >
        {'users' in delegation && delegation.users.length > 0 ? (
          <TruncatedList
            addEllipsis
            customOverflowButton={(numHiddenItems) => (
              <Box
                sx={{
                  alignItems: 'center',
                  backgroundColor:
                    theme.name === 'light'
                      ? theme.tokens.color.Ultramarine[20]
                      : theme.tokens.color.Neutrals.Black,
                  borderRadius: 1,
                  display: 'flex',
                  height: '20px',
                  maxWidth: 'max-content',
                  padding: `${theme.tokens.spacing.S4} ${theme.tokens.spacing.S8}`,
                  position: 'relative',
                  marginLeft: theme.tokens.spacing.S12,
                }}
              >
                <Tooltip
                  tooltipPlacement="top"
                  tooltipText="Click to View All Delegate Users"
                >
                  <Button
                    onClick={handleUpdateDelegations}
                    style={{
                      color: theme.tokens.alias.Content.Text.Primary.Default,
                      font: theme.tokens.alias.Typography.Label.Regular.Xs,
                      padding: 0,
                    }}
                    variant="link"
                  >
                    +{numHiddenItems}
                  </Button>
                </Tooltip>
              </Box>
            )}
            justifyOverflowButtonRight
            listContainerSx={{
              width: '100%',
              overflow: 'hidden',
              maxHeight: 24,
              gap: 1,
              '& .last-visible-before-overflow': {
                '&::after': {
                  top: 1,
                  right: -13,
                },
              },
            }}
          >
            {delegation.users.map((user: string, index: number) => (
              <Typography key={user} variant="body1">
                {user}
                {index < delegation.users.length - 1 && ', '}
              </Typography>
            ))}
          </TruncatedList>
        ) : (
          <Typography
            sx={{ fontStyle: 'italic', textTransform: 'capitalize' }}
            variant="body1"
          >
            No Users Added
          </Typography>
        )}
      </TableCell>
      <TableCell
        actionCell
        sx={{
          textAlign: 'center',
          paddingRight: Spacing.S0,
        }}
      >
        <InlineMenuAction
          isActionDisabled={!permissions.update_delegate_users}
          label="Update Delegation"
          onClick={handleUpdateDelegations}
          pendoID={IAM_PARENT_USERS_PENDO_IDS.updateDelegation}
          tooltipText="You do not have permission to update delegations."
        />
      </TableCell>
      <UpdateDelegationsDrawer
        delegation={delegation}
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
      />
    </TableRow>
  );
};
