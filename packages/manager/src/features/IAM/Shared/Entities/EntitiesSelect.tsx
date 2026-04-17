import {
  Button,
  Checkbox,
  LoadingSpinner,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from '@akamai/cds-components/react';
import { Notice, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import React from 'react';

import { FormLabel } from 'src/components/FormLabel';
import { Link } from 'src/components/Link';
import { useAllAccountEntities } from 'src/queries/entities/entities';

import { getFormattedEntityType } from '../utilities';
import {
  getCreateLinkForEntityType,
  getEntitiesByType,
  getPlaceholder,
  mapEntitiesToOptions,
} from './utils';

import type { DrawerModes, EntitiesOption } from '../types';
import type { AccessType, IamAccessType } from '@linode/api-v4/lib/iam/types';

interface Props {
  access: IamAccessType;
  errorText?: string;
  mode?: DrawerModes;
  onChange: (value: EntitiesOption[]) => void;
  type: AccessType;
  value: EntitiesOption[];
}

// For large entity lists, we want to display the initial 100 results and then load more as the user scrolls.
const INITIAL_DISPLAY_COUNT = 100;

export const EntitiesSelect = ({
  access,
  errorText,
  mode,
  onChange,
  type,
  value,
}: Props) => {
  const {
    data: entities,
    error: fetchError,
    isLoading,
  } = useAllAccountEntities({});
  const theme = useTheme();

  const entityOptions = React.useMemo(() => {
    if (access !== 'entity_access' || !entities) {
      return [];
    }
    const typeEntities = getEntitiesByType(type, entities);

    return typeEntities ? mapEntitiesToOptions(typeEntities) : [];
  }, [entities, access, type]);

  const [filterText, setFilterText] = React.useState('');
  const [showSelectedOnly, setShowSelectedOnly] = React.useState(false);
  const [displayCount, setDisplayCount] = React.useState(INITIAL_DISPLAY_COUNT);

  const filteredRows = React.useMemo(() => {
    const filtered = filterText
      ? entityOptions.filter((opt) =>
          opt.label.toLowerCase().includes(filterText.toLowerCase())
        )
      : entityOptions;
    const withRank = filtered.map((opt, idx) => ({
      rank: idx,
      name: opt.label,
      option: opt,
    }));
    if (showSelectedOnly) {
      return withRank.filter((p) =>
        value.some((v) => v.value === p.option.value)
      );
    }
    return withRank;
  }, [entityOptions, filterText, showSelectedOnly, value]);

  React.useEffect(() => {
    setDisplayCount(INITIAL_DISPLAY_COUNT);
  }, [filterText, showSelectedOnly]);

  const visibleRows = React.useMemo(() => {
    const slice = filteredRows.slice(0, displayCount);
    // Always include selected items even if beyond the display slice
    const selectedNotVisible = filteredRows.filter(
      (p) =>
        value.some((v) => v.value === p.option.value) &&
        !slice.some((s) => s.rank === p.rank)
    );
    return [...slice, ...selectedNotVisible];
  }, [filteredRows, displayCount, value]);

  const selectionMap = React.useMemo(() => {
    const map: Record<number, boolean> = {};
    filteredRows.forEach((p) => {
      if (value.some((v) => v.value === p.option.value)) {
        map[p.rank] = true;
      }
    });
    return map;
  }, [filteredRows, value]);

  const selectedCount = value.length;
  const clearDisabled = !filteredRows.some((p) =>
    value.some((v) => v.value === p.option.value)
  );
  const selectAllDisabled = filteredRows.every((p) =>
    value.some((v) => v.value === p.option.value)
  );

  const handleClear = () => {
    const visibleValues = new Set(filteredRows.map((p) => p.option.value));
    onChange(value.filter((v) => !visibleValues.has(v.value)));
  };

  const handleSelectAll = () => {
    const currentValues = new Set(value.map((v) => v.value));
    const toAdd = filteredRows
      .filter((p) => !currentValues.has(p.option.value))
      .map((p) => p.option);
    onChange([...value, ...toAdd]);
  };

  const toggleEntity = (rank: number, checked: boolean) => {
    const p = filteredRows.find((item) => item.rank === rank);
    if (!p) return;
    if (checked) {
      if (!value.some((v) => v.value === p.option.value)) {
        onChange([...value, p.option]);
      }
    } else {
      onChange(value.filter((v) => v.value !== p.option.value));
    }
  };

  const isReadOnly = mode === 'change-role';

  if (access === 'account_access') {
    return (
      <>
        <FormLabel>
          <Typography
            sx={{
              marginBottom: theme.tokens.spacing.S8,
              font: theme.tokens.alias.Typography.Label.Bold.S,
            }}
          >
            Entities
          </Typography>
        </FormLabel>
        <Typography>
          {type === 'account'
            ? 'All entities'
            : `All ${getFormattedEntityType(type)}s`}
        </Typography>
      </>
    );
  }

  return (
    <>
      {errorText && (
        <Notice spacingBottom={8} variant="error">
          <Typography fontSize="inherit">{errorText}</Typography>
        </Notice>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.tokens.spacing.S8,
          width: '100%',
        }}
      >
        <p
          style={{
            font: theme.tokens.alias.Typography.Label.Bold.S,
            margin: 0,
          }}
        >
          Entities
        </p>
        <TextField
          disabled={isLoading || entityOptions.length === 0}
          onChange={(e) => {
            const target = e.target as HTMLInputElement | null;
            setFilterText(target?.value ?? '');
          }}
          placeholder={getPlaceholder(type, value.length, entityOptions.length)}
          value={filterText}
        />
        {entityOptions.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: theme.tokens.spacing.S6,
              minHeight: theme.tokens.spacing.S40,
              padding: `${theme.tokens.spacing.S4} ${theme.tokens.spacing.S12}`,
              border: `1px solid ${theme.tokens.component.Pagination.Border}`,
              background: theme.tokens.component.Pagination.Background,
              fontSize: theme.tokens.font.FontSize.Xs,
              color: theme.tokens.component.Pagination.Text.Default,
            }}
          >
            <span style={{ flex: 1 }}>
              Items: {filteredRows.length} | Selected: {selectedCount}
            </span>
            <Checkbox
              checked={showSelectedOnly}
              onChange={(e) => setShowSelectedOnly(Boolean(e.detail))}
            >
              Show only selected
            </Checkbox>
            <div style={{ width: '100%', display: 'flex', gap: '6px' }}>
              <Button
                disabled={clearDisabled || isReadOnly}
                onClick={handleClear}
                type="button"
                variant="link"
              >
                Clear
              </Button>
              <Button
                disabled={selectAllDisabled || isReadOnly}
                onClick={handleSelectAll}
                type="button"
                variant="link"
              >
                Select all
              </Button>
            </div>
          </div>
        )}
        <div
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            if (scrollHeight - scrollTop <= clientHeight * 1.5) {
              setDisplayCount((prev) =>
                Math.min(prev + 200, filteredRows.length)
              );
            }
          }}
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            overflowX: 'hidden',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Table>
            <TableBody>
              {visibleRows.map((p) => (
                <TableRow
                  hoverable
                  key={p.rank}
                  onClick={(e: React.MouseEvent) => {
                    if (isReadOnly) return;
                    const t = e.target as Element;
                    if (t.closest?.('cds-menu') || t.closest?.('cds-checkbox'))
                      return;
                    toggleEntity(p.rank, !selectionMap[p.rank]);
                  }}
                  rowborder
                  selected={!!selectionMap[p.rank]}
                >
                  <TableCell>
                    <Checkbox
                      checked={!!selectionMap[p.rank]}
                      disabled={isReadOnly}
                      onChange={(e) => {
                        toggleEntity(p.rank, Boolean(e.detail));
                      }}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                    <span style={{ flex: 1, lineHeight: '20px', minWidth: 0 }}>
                      {p.name}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                <TableRow>
                  <TableCell style={{ justifyContent: 'center' }}>
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                !fetchError &&
                visibleRows.length === 0 &&
                entityOptions.length > 0 && (
                  <TableRow>
                    <TableCell style={{ justifyContent: 'center' }}>
                      No entities found
                    </TableCell>
                  </TableRow>
                )}
              {fetchError && (
                <TableRow>
                  <TableCell style={{ justifyContent: 'center' }}>
                    {(fetchError as { reason?: string })?.reason ??
                      'Failed to load entities'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!entityOptions.length && !isLoading && (
        <Notice spacingBottom={0} variant="warning">
          <Typography fontSize="inherit">
            <Link to={getCreateLinkForEntityType(type)}>
              Create {type === 'image' ? `an` : `a`}{' '}
              {getFormattedEntityType(type)} Entity{' '}
            </Link>{' '}
            first or choose a different role to continue assignment.
          </Typography>
        </Notice>
      )}
    </>
  );
};
