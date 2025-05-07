import { useAllTagsQuery, useLinodesQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import {
  Autocomplete,
  Box,
  CircleProgress,
  CloseIcon,
  Hidden,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { useDebouncedValue } from '@linode/utilities';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { LinodeRow } from '../LinodesLanding/LinodeRow/LinodeRow';
import { LinodesLandingEmptyState } from '../LinodesLanding/LinodesLandingEmptyState';
import { Code } from 'src/components/Code/Code';
import { Link } from 'src/components/Link';

const siteTypeOptions = [{ label: 'Core' }, { label: 'Distributed' }];

export const LinodesLandingV2 = () => {
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const history = useHistory();
  const { search } = useLocation();

  const queryParams = React.useMemo(
    () => new URLSearchParams(search),
    [search]
  );

  const query = queryParams.get('query');

  const debouncedQuery = useDebouncedValue(query);

  const { data: tags } = useAllTagsQuery();

  const pagination = usePagination();
  const { handleOrderChange, order, orderBy } = useOrder();

  const { error: searchParseError, filter } = getAPIFilterFromQuery(
    debouncedQuery,
    {
      searchableFieldsWithoutOperator: ['label', 'tags', 'ipv4'],
    }
  );

  const { data, error, isFetching, isLoading } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      ['+order']: order,
      ['+order_by']: orderBy,
      ...filter,
    }
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0 && !debouncedQuery) {
    return <LinodesLandingEmptyState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Linodes" />
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Linodes',
          removeCrumbX: 1,
        }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Linodes',
          }),
        }}
        disabledCreateButton={isRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/linodes"
        entity="Linode"
        onButtonClick={() => history.push('/linodes/create')}
        title="Linodes"
      />
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1}
        justifyContent="space-between"
        mb={1}
      >
        <TextField
          containerProps={{ flexGrow: 1 }}
          errorText={searchParseError?.message}
          hideLabel
          InputProps={{
            endAdornment: query && (
              <InputAdornment position="end">
                {isFetching && <CircleProgress size="sm" />}

                <IconButton
                  aria-label="Clear"
                  onClick={() => {
                    queryParams.delete('query');
                    history.push({ search: queryParams.toString() });
                  }}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          label="Search"
          onChange={(e) => {
            queryParams.set('query', e.target.value);
            history.push({ search: queryParams.toString() });
          }}
          placeholder="Find Linode by attribute or tag"
          tooltipText={
            <Stack spacing={2}>
              <Typography>
                You can prepending your search with supported attributes to
                narrow your search.{' '}
              </Typography>
              <Stack spacing={0.5}>
                <Typography sx={(theme) => ({ font: theme.font.bold })}>
                  Examples
                </Typography>
                <Typography fontSize="0.8rem">
                  <Code>label: my-linode</Code>
                </Typography>
                <Typography fontSize="0.8rem">
                  <Code>ipv4: 192.168.235.146</Code>
                </Typography>
                <Typography fontSize="0.8rem">
                  <Code>region = us-mia</Code>
                </Typography>
              </Stack>
              <Typography>
                You can also use operators like <Code>and</Code>, <Code>or</Code>, <Code>:</Code> (contains), <Code>=</Code>
                (equals) to perform more complex searches.{' '}
                <Link to="https://linode.com/fake-docs-page">Learn more.</Link>
              </Typography>
              <Stack spacing={0.5}>
                <Typography sx={(theme) => ({ font: theme.font.bold })}>
                  Examples
                </Typography>
                <Typography fontSize="0.8rem">
                  <Code>tag: production or tag: staging</Code>
                </Typography>
                <Typography fontSize="0.8rem">
                  <Code>label: my-linode and tag: dev</Code>
                </Typography>
                <Typography fontSize="0.8rem">
                  <Code>region = us-mia and tag: test</Code>
                </Typography>
              </Stack>
            </Stack>
          }
          tooltipWidth={350}
          value={query ?? ''}
        />
        <Autocomplete
          label="Site Type"
          onChange={(e, value) => {
            let newQuery = query ?? '';
            if (!value) {
              // remove site_type from query
              newQuery = newQuery.replace(/site_type = \S+/g, '');
            } else if (newQuery?.includes('site_type')) {
              // update site_type
              newQuery = newQuery.replace(
                /site_type = \S+/g,
                `site_type = ${value.label.toLowerCase()}`
              );
            } else {
              // add site type to query
              newQuery += ` site_type = ${value.label.toLowerCase()}`;
            }
            queryParams.set('query', newQuery.trim());
            history.push({ search: queryParams.toString() });
          }}
          options={siteTypeOptions}
          placeholder="Filter by site type"
          sx={{ minWidth: 250 }}
          textFieldProps={{ hideLabel: true }}
          value={
            siteTypeOptions.find((o) =>
              query?.includes(`site_type = ${o.label.toLowerCase()}`)
            ) ?? null
          }
        />
        <Autocomplete
          disableSelectAll
          label="Tags"
          limitTags={1}
          multiple
          onChange={(e, tags) => {
            let newQuery = query ?? '';
            //  remove existing tags from query
            newQuery = newQuery.replace(/\(tag: [^)]*\)/g, '');
            newQuery = newQuery.replace(/tag:\s*([^\s]+)\s*/g, '');
            // update query with selected tags
            if (tags.length > 0) {
              if (tags.length === 1) {
                newQuery += ' ' + tags.map((tag) => `tag: ${tag.label}`) + '';
              } else {
                newQuery +=
                  ' (' +
                  tags.map((tag) => `tag: ${tag.label}`).join(' or ') +
                  ')';
              }
            }
            queryParams.set('query', newQuery.trim());
            history.push({ search: queryParams.toString() });
          }}
          options={tags ?? []}
          placeholder="Filter by tags"
          sx={{ minWidth: 250 }}
          textFieldProps={{ hideLabel: true }}
          value={
            tags?.filter((tag) => query?.includes(`tag: ${tag.label}`)) ?? []
          }
        />
      </Stack>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableCell>Status</TableCell>
            <Hidden smDown>
              <TableCell>Plan</TableCell>
              <TableCell>Public IP Address</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <Hidden lgDown>
              <TableCell>Last Backup</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'tags'}
                direction={order}
                handleClick={handleOrderChange}
                label="tags"
              >
                Tags
              </TableSortCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {error && <TableRowError colSpan={8} message={error[0].reason} />}
          {data?.data.length === 0 && (
            <TableRowEmpty colSpan={8} message="No Linodes found" />
          )}
          {data?.data.map((linode) => (
            <LinodeRow
              key={linode.id}
              {...linode}
              handlers={{
                onOpenDeleteDialog: () => null,
                onOpenMigrateDialog: () => null,
                onOpenPowerDialog: () => null,
                onOpenRebuildDialog: () => null,
                onOpenRescueDialog: () => null,
                onOpenResizeDialog: () => null,
              }}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="Linodes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};
