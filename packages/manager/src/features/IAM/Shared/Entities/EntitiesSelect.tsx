import { NotificationBanner } from '@akamai/cds-components/react';
import { Font, Spacing } from '@akamai/cds-tokens';
import React from 'react';

import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useAllAccountEntities } from '../../queries/entities/entities';
import { Link } from '../Link/Link';
import { SelectionPanel } from '../SelectionPanel/SelectionPanel';
import { getFormattedEntityType } from '../utilities';
import { getCreateLinkForEntityType, getPlaceholder } from './utils';

import type { DrawerModes, EntitiesOption } from '../types';
import type { AccountEntity } from '@linode/api-v4';
import type { AccessType, IamAccessType } from '@linode/api-v4/lib/iam/types';

interface Props {
  access: IamAccessType;
  errorText?: string;
  mode?: DrawerModes;
  onChange: (value: EntitiesOption[]) => void;
  type: AccessType;
  value: EntitiesOption[];
}

const MIN_PAGE_SIZE = 10;

export const EntitiesSelect = ({
  access,
  errorText,
  mode,
  onChange,
  type,
  value,
}: Props) => {
  const [filterText, setFilterText] = React.useState('');
  const [showSelectedOnlyState, setShowSelectedOnlyState] =
    React.useState(false);
  const debouncedFilterText = useDebouncedValue(filterText);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(MIN_PAGE_SIZE);

  const {
    data: allEntities,
    error: fetchError,
    isFetching,
  } = useAllAccountEntities({});

  const entityOptions = React.useMemo(() => {
    if (access !== 'entity_access' || !allEntities) {
      return [];
    }
    return (allEntities as unknown as AccountEntity[])
      .filter((e) => e.type === type)
      .map((e) => ({ label: e.label, value: e.id }));
  }, [allEntities, access, type]);

  const totalEntityCount = entityOptions.length;

  const isSearching =
    filterText.length > 0 && debouncedFilterText !== filterText;
  const isLoading = isFetching || isSearching;

  const isReadOnly = mode === 'change-role';
  const showSelectedOnly = isReadOnly || showSelectedOnlyState;

  const filteredRows = React.useMemo(() => {
    const matchesFilter = (opt: EntitiesOption) =>
      !debouncedFilterText ||
      opt.label.toLowerCase().includes(debouncedFilterText.toLowerCase());
    const source = showSelectedOnly ? value : entityOptions;
    return source.filter(matchesFilter).map((opt, idx) => ({
      rank: idx,
      name: opt.label,
      option: opt,
    }));
  }, [entityOptions, debouncedFilterText, showSelectedOnly, value]);

  const totalCount = filteredRows.length;
  const effectivePage = Math.min(
    page,
    Math.max(1, Math.ceil(totalCount / pageSize))
  );

  const paginatedRows = React.useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, effectivePage, pageSize]);

  const showNoEntitiesText =
    !isFetching &&
    !isSearching &&
    !fetchError &&
    paginatedRows.length === 0 &&
    entityOptions.length > 0;

  const selectionMap = React.useMemo(() => {
    const map: Record<number, boolean> = {};
    filteredRows.forEach((p) => {
      if (value.some((v) => v.value === p.option.value)) {
        map[p.rank] = true;
      }
    });
    return map;
  }, [filteredRows, value]);

  const clearDisabled = !filteredRows.some((p) =>
    value.some((v) => v.value === p.option.value)
  );

  const scopedOptions = React.useMemo(
    () => filteredRows.map((row) => row.option),
    [filteredRows]
  );

  const selectedScopedCount = React.useMemo(
    () =>
      scopedOptions.filter((opt) =>
        value.some((selected) => selected.value === opt.value)
      ).length,
    [scopedOptions, value]
  );

  const handleClear = () => {
    const visibleValues = new Set(filteredRows.map((p) => p.option.value));
    const remaining = value.filter((v) => !visibleValues.has(v.value));
    onChange(remaining);
    if (remaining.length === 0 && showSelectedOnly) {
      setShowSelectedOnlyState(false);
    }
  };

  const handleSelectAll = () => {
    const allCurrentOptionsSelected =
      scopedOptions.length > 0 && selectedScopedCount >= scopedOptions.length;
    if (allCurrentOptionsSelected) {
      onChange([]);
    } else {
      onChange(scopedOptions);
    }
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

  if (access === 'account_access') {
    return (
      <>
        <p
          style={{
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            fontWeight: Font.FontWeight.Bold,
            marginBottom: Spacing.S8,
          }}
        >
          Entities
        </p>
        <p>
          {type === 'account'
            ? 'All entities'
            : `All ${getFormattedEntityType(type)}s`}
        </p>
      </>
    );
  }

  return (
    <>
      {errorText && (
        <NotificationBanner style={{ marginBottom: Spacing.S8 }} type="error">
          {errorText}
        </NotificationBanner>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <p
          style={{
            fontSize: Font.FontSize.S,
            // eslint-disable-next-line @linode/cloud-manager/no-custom-fontWeight
            fontWeight: Font.FontWeight.Bold,
          }}
        >
          Entities
        </p>
        <SelectionPanel
          effectivePage={effectivePage}
          errorText={
            fetchError
              ? ((fetchError as { reason?: string })?.reason ??
                'Failed to load entities')
              : undefined
          }
          filterPlaceholder={getPlaceholder(
            type,
            value.length,
            totalEntityCount
          )}
          filterText={filterText}
          isClearDisabled={clearDisabled || isReadOnly}
          isDisabled={isReadOnly}
          isFilterDisabled={entityOptions.length === 0 || isReadOnly}
          isFilterLoading={isLoading}
          isLoading={isLoading}
          isSelectAllDisabled={
            isReadOnly ||
            scopedOptions.length === 0 ||
            selectedScopedCount >= scopedOptions.length
          }
          isShowSelectedOnlyDisabled={value.length === 0 || isReadOnly}
          minPageSize={MIN_PAGE_SIZE}
          noItemsText="No entities found"
          onClear={handleClear}
          onFilterTextChange={(text) => {
            setFilterText(text);
            setPage(1);
          }}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onSelectAll={handleSelectAll}
          onShowSelectedOnlyChange={(show) => {
            setShowSelectedOnlyState(show);
            setPage(1);
          }}
          onToggle={toggleEntity}
          pageSize={pageSize}
          pageSizes={[10, 20, 50]}
          paginatedRows={paginatedRows}
          selectedCount={value.length}
          selectionLabel="Selected:"
          selectionMap={selectionMap}
          showEmptyState={showNoEntitiesText}
          showSelectedOnly={showSelectedOnly}
          showToolbar={totalEntityCount > 0}
          totalCount={totalCount}
        />
      </div>

      {totalEntityCount === 0 && !isFetching && (
        <NotificationBanner
          style={{ marginBottom: 0, marginTop: Spacing.S8 }}
          type="warning"
        >
          <p>
            <Link to={getCreateLinkForEntityType(type)}>
              Create {type === 'image' ? `an` : `a`}{' '}
              {getFormattedEntityType(type)} Entity{' '}
            </Link>{' '}
            first or choose a different role to continue assignment.
          </p>
        </NotificationBanner>
      )}
    </>
  );
};
