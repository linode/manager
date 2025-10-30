import { Box, Button, Hidden, Paper, Typography } from '@linode/ui';
import React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';

import { ImageRow } from '../ImageRow';

import type { ImageViewTableColConfig } from '../../utils';
import type { Handlers as ImageHandlers } from '../ImagesActionMenu';
import type { APIError, Event, Image } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import type { Order } from 'src/hooks/useOrderV2';

interface HeaderProps {
  buttonProps?: {
    buttonText: string;
    disabled?: boolean;
    onButtonClick: () => void;
    tooltipText?: string;
  };
  description?: React.ReactNode;
  docsLink?: string;
  title: string;
}

interface ImagesTableProps {
  columns: ImageViewTableColConfig[];
  emptyMessage: string;
  error?: APIError[] | null;
  eventCategory: string;
  events: {
    [k: string]: Event | undefined;
  };
  handleOrderChange: (newOrderBy: string, newOrder: Order) => void;
  handlers: ImageHandlers;
  headerProps?: HeaderProps;
  hideActionMenu?: boolean;
  images: Image[];
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
}

const useStyles = makeStyles()((theme: Theme) => ({
  imageTable: {
    marginBottom: theme.spacingFunction(24),
    padding: 0,
  },
  imageTableHeader: {
    border: `1px solid ${theme.tokens.alias.Border.Normal}`,
    borderBottom: 0,
    padding: theme.spacingFunction(8),
    paddingLeft: theme.spacingFunction(12),
  },
  imageTableSubheader: {
    marginTop: theme.spacingFunction(8),
  },
}));

export const ImagesTable = (props: ImagesTableProps) => {
  const {
    headerProps,
    images,
    orderBy,
    order,
    handleOrderChange,
    columns,
    events,
    handlers,
    error,
    query,
    pagination,
    eventCategory,
    emptyMessage,
    hideActionMenu,
  } = props;

  const { classes } = useStyles();

  return (
    <Paper className={classes.imageTable}>
      {headerProps && headerProps.title && (
        <div className={classes.imageTableHeader}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h3">{headerProps.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {headerProps.docsLink && (
                <DocsLink
                  analyticsLabel={headerProps.title}
                  href={headerProps.docsLink}
                />
              )}
              {headerProps.buttonProps && (
                <Button
                  buttonType="primary"
                  disabled={headerProps.buttonProps?.disabled}
                  onClick={headerProps.buttonProps?.onButtonClick}
                  tooltipText={headerProps.buttonProps?.tooltipText}
                >
                  {headerProps.buttonProps.buttonText}
                </Button>
              )}
            </Box>
          </Box>
          {headerProps.description && (
            <Typography className={classes.imageTableSubheader}>
              {headerProps.description}
            </Typography>
          )}
        </div>
      )}
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col, idx) => {
              if (col.sortable && col.label) {
                return (
                  <TableSortCell
                    active={orderBy === col.label}
                    direction={order}
                    handleClick={handleOrderChange}
                    key={idx}
                    label={col.label}
                  >
                    {col.header}
                  </TableSortCell>
                );
              } else {
                return (
                  <Hidden key={idx} {...col.hiddenProps}>
                    <TableCell>{col.header}</TableCell>
                  </Hidden>
                );
              }
            })}
            {!hideActionMenu && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {images?.length === 0 && (
            <TableRowEmpty
              colSpan={columns.length + 1}
              message={emptyMessage}
            />
          )}
          {error && query && (
            <TableRowError
              colSpan={columns.length + 1}
              message={error[0].reason}
            />
          )}
          {images?.map((image) => (
            <ImageRow
              event={events[image.id]}
              handlers={handlers}
              image={image}
              key={image.id}
            />
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
    </Paper>
  );
};
