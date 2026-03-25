import {
  Box,
  Button,
  ErrorState,
  Hidden,
  Typography,
  useTheme,
  ZeroStateSearchNarrowIcon,
} from '@linode/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from 'akamai-cds-react-components/Table';
import React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';

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
    pendoId?: string;
    tooltipText?: string;
  };
  description?: React.ReactNode;
  docsLink?: { href: string; label?: string; pendoId?: string };
  title: string;
}

interface ShareGroupsTableProps {
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

export const ShareGroupsTable = (props: ShareGroupsTableProps) => {
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

  const theme = useTheme();

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
                  data-pendo-id={headerProps.buttonProps?.pendoId}
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
            <TableRow
              headerbackground={
                theme.tokens.component.Table.HeaderNested.Background
              }
              headerborder
            >
              {columns.map((col, idx) => {
                const cell = col.sortableProps ? (
                  <TableHeaderCell
                    key={idx}
                    sort={() =>
                      handleOrderChange(
                        col.sortableProps?.label ?? col.name,
                        order === 'asc' ? 'desc' : 'asc'
                      )
                    }
                    sortable
                    sorted={
                      orderBy === col.sortableProps?.label ? order : undefined
                    }
                    style={{ ...col.style }}
                  >
                    {col.name}
                  </TableHeaderCell>
                ) : (
                  <TableHeaderCell key={idx} style={{ ...col.style }}>
                    {col.name}
                  </TableHeaderCell>
                );

                return col.hidden ? (
                  <Hidden key={idx} {...{ [col.hidden]: true }}>
                    {cell}
                  </Hidden>
                ) : (
                  cell
                );
              })}
              <TableHeaderCell style={{ maxWidth: '40px' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {!error && shareGroups.length === 0 && (
              <TableRow rowborder>
                <TableCell
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  <Box
                    sx={(theme) => ({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: theme.spacingFunction(4),
                      p: `{theme.spacingFunction(24)} $theme.spacingFunction(32)}`,
                      width: '100%',
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
                </TableCell>
              </TableRow>
            )}
            {error && query && (
              <TableRow rowborder>
                <TableCell>
                  <ErrorState compact errorText={error[0].reason} />
                </TableCell>
              </TableRow>
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
