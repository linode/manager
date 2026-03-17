import {
  Box,
  Button,
  Hidden,
  Typography,
  ZeroStateSearchNarrowIcon,
} from '@linode/ui';
import React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';

import {
  StyledImageContainer,
  StyledImageTableContainer,
  StyledImageTableHeader,
  StyledImageTableSubheader,
} from '../ImageLibrary/ImagesTable.styles';
import { ShareGroupRow } from './ShareGroupRow';

import type { ShareGroupsViewTableColConfig } from './shareGroupsTabsConfig';
import type { APIError, Sharegroup } from '@linode/api-v4';
import type { Order } from 'src/hooks/useOrderV2';

interface HeaderProps {
  buttonProps?: {
    buttonText?: string;
    disabled?: boolean;
    onButtonClick: () => void;
    tooltipText?: string;
  };
  description?: React.ReactNode;
  docsLink?: { href: string; label?: string };
  title: string;
}

interface OwnedGroupsTableProps {
  columns: ShareGroupsViewTableColConfig[];
  emptyMessage: {
    instruction?: string;
    main: string;
  };
  error?: APIError[] | null;
  eventCategory: string;
  handleOrderChange: (newOrderBy: string, newOrder: Order) => void;
  headerProps?: HeaderProps;
  order: Order;
  orderBy: string;
  pagination: {
    count: number;
    handlePageChange: (newPage: number) => void;
    handlePageSizeChange: (newSize: number) => void;
    page: number;
    pageSize: number;
  };
  query?: string;
  shareGroups: Sharegroup[];
}

export const ShareGroupsTable = (props: OwnedGroupsTableProps) => {
  const {
    columns,
    headerProps,
    eventCategory,
    shareGroups,
    query,
    handleOrderChange,
    error,
    emptyMessage,
    order,
    orderBy,
    pagination,
  } = props;
  return (
    <StyledImageContainer>
      {headerProps && headerProps.title && (
        <StyledImageTableHeader>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h3">{headerProps.title}</Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                minHeight: 40,
              }}
            >
              {headerProps.docsLink && (
                <DocsLink
                  analyticsLabel={headerProps.title}
                  href={headerProps.docsLink.href}
                  label={headerProps.docsLink.label}
                />
              )}
              {headerProps.buttonProps && (
                <Button
                  buttonType="primary"
                  data-pendo-id={`${eventCategory}-create-button`}
                  disabled={headerProps.buttonProps.disabled}
                  onClick={headerProps.buttonProps.onButtonClick}
                  tooltipText={headerProps.buttonProps.tooltipText}
                >
                  {headerProps.buttonProps.buttonText}
                </Button>
              )}
            </Box>
          </Box>
          {headerProps.description && (
            <StyledImageTableSubheader>
              {headerProps.description}
            </StyledImageTableSubheader>
          )}
        </StyledImageTableHeader>
      )}
      <StyledImageTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => {
                const cell = col.sortableProps ? (
                  <TableSortCell
                    active={orderBy === col.sortableProps?.label}
                    direction={order}
                    handleClick={handleOrderChange}
                    key={idx}
                    label={col.sortableProps?.label}
                  >
                    {col.name}
                  </TableSortCell>
                ) : (
                  <TableCell key={idx}>{col.name}</TableCell>
                );
                return col.hidden ? (
                  <Hidden key={idx} {...{ [col.hidden]: true }}>
                    {cell}
                  </Hidden>
                ) : (
                  cell
                );
              })}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {!error && shareGroups.length === 0 && (
              <TableRowEmpty
                colSpan={columns.length + 1}
                message={
                  <Box
                    sx={(theme) => ({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: theme.spacingFunction(4),
                      p: `${theme.spacingFunction(24)} ${theme.spacingFunction(32)}`,
                    })}
                  >
                    <ZeroStateSearchNarrowIcon />
                    <Typography variant="h3">{emptyMessage.main}</Typography>
                    {!query && emptyMessage.instruction && (
                      <Typography variant="body1">
                        {emptyMessage.instruction}
                      </Typography>
                    )}
                  </Box>
                }
              />
            )}
            {error && query && (
              <TableRowError
                colSpan={columns.length + 1}
                message={error[0].reason}
              />
            )}

            {shareGroups.map((sharegroup) => (
              <ShareGroupRow key={sharegroup.id} shareGroup={sharegroup} />
            ))}
          </TableBody>
        </Table>
        <PaginationFooter
          count={pagination.count}
          eventCategory={eventCategory}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </StyledImageTableContainer>
    </StyledImageContainer>
  );
};
