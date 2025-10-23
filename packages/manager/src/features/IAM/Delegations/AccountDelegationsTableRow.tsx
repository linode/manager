import { Box, Button, Tooltip, Typography, useTheme } from '@linode/ui';
import React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';

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
        <Typography variant="body1">{delegation.company}</Typography>
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
                  placement="top"
                  title="Click to View All Delegate Users"
                >
                  <Button
                    onClick={handleUpdateDelegations}
                    sx={{
                      color: theme.tokens.alias.Content.Text.Primary.Default,
                      font: theme.tokens.alias.Typography.Label.Regular.Xs,
                      padding: 0,
                    }}
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
            no delegate users added
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <InlineMenuAction
          actionText="Update Delegations"
          buttonHeight={40}
          onClick={handleUpdateDelegations}
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
