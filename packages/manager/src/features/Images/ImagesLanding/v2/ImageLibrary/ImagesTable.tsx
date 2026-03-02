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
import { TableSortCell } from 'src/components/TableSortCell';

import { ImageRow } from '../../ImageRow';
import {
  StyledImageContainer,
  StyledImageTableContainer,
  StyledImageTableHeader,
  StyledImageTableSubheader,
} from './ImagesTable.styles';

import type { Handlers as ImageHandlers } from '../../ImagesActionMenu';
import type {
  ImageConfig,
  ImageViewTableColConfig,
} from './imageLibraryTabsConfig';
import type { APIError, Event, Image } from '@linode/api-v4';
import type { Order } from 'src/hooks/useOrderV2';

interface HeaderProps {
  buttonProps?: {
    buttonText: string;
    disabled?: boolean;
    onButtonClick: () => void;
    tooltipText?: string;
  };
  description?: React.ReactNode;
  docsLink?: ImageConfig['docsLink'];
  title: string;
}

interface ImagesTableProps {
  columns: ImageViewTableColConfig[];
  emptyMessage: ImageConfig['emptyMessage'];
  error?: APIError[] | null;
  eventCategory: string;
  events: {
    [k: string]: Event | undefined;
  };
  handleOrderChange: (newOrderBy: string, newOrder: Order) => void;
  handlers: ImageHandlers;
  headerProps?: HeaderProps;
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
                minHeight: 40, // Ensures consistent height even if only one child
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
                    active={orderBy === col.sortableProps.label}
                    direction={order}
                    handleClick={handleOrderChange}
                    key={idx}
                    label={col.sortableProps.label}
                  >
                    {col.name}
                  </TableSortCell>
                ) : (
                  <TableCell key={idx}>{col.name}</TableCell>
                );

                return col.hiddenOn ? (
                  <Hidden key={idx} {...{ [col.hiddenOn]: true }}>
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
            {!error && images?.length === 0 && (
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
      </StyledImageTableContainer>
    </StyledImageContainer>
  );
};
