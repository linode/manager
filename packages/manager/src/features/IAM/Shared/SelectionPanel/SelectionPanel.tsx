import {
  Button,
  Checkbox,
  Pagination,
  SearchField,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@akamai/cds-components/react';
import { Font, Spacing } from '@akamai/cds-tokens';
import React from 'react';

import { useBreakpoint } from 'src/features/IAM/hooks/useBreakpoint';

import { CircleProgress } from '../CircleProgress/CircleProgress';

export interface SelectableOption {
  label: string;
  value: number | string;
}

export interface SelectableRow {
  name: string;
  option: SelectableOption;
  rank: number;
}

interface SelectionPanelProps {
  effectivePage: number;
  /** Error message to display in the table body. */
  errorText?: string;
  filterPlaceholder?: string;
  filterText: string;
  isClearDisabled: boolean;
  /** Disables row clicks and checkboxes (e.g. while submitting or in read-only mode). */
  isDisabled?: boolean;
  isFilterDisabled?: boolean;
  isFilterLoading?: boolean;
  isLoading: boolean;
  isSelectAllDisabled: boolean;
  isShowSelectedOnlyDisabled?: boolean;
  /** Optional label shown next to the spinner (e.g. "Fetching all users..."). */
  loadingLabel?: string;
  /** Minimum page size threshold – pagination is hidden when totalCount ≤ this. */
  minPageSize: number;
  /** Text in the "no items" row. Defaults to "No items found". */
  noItemsText?: string;
  onClear: () => void;
  onFilterTextChange: (text: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectAll: () => void;
  onShowSelectedOnlyChange: (show: boolean) => void;
  onToggle: (rank: number, checked: boolean) => void;
  pageSize: number;
  pageSizes: number[];
  /** Rows currently visible in the table (already paginated by the parent). */
  paginatedRows: SelectableRow[];
  /** Number of currently selected items (across all pages). */
  selectedCount: number;
  /** Label in the count display, e.g. "Users selected:" or "Selected:". */
  selectionLabel?: string;
  /** Map of rank → selected boolean for visible rows. */
  selectionMap: Record<number, boolean>;
  /** Whether to show the "no items found" row. */
  showEmptyState: boolean;
  /** Override to hide pagination even when totalCount > minPageSize (e.g. while fetching all). */
  showPagination?: boolean;
  showSelectedOnly: boolean;
  /** Whether to render the toolbar row at all (hide when no items exist yet). */
  showToolbar?: boolean;
  /** Total count used for the "X/total" display and pagination. */
  totalCount: number;
}

export const SelectionPanel = ({
  effectivePage,
  errorText,
  filterPlaceholder,
  filterText,
  isClearDisabled,
  isDisabled,
  isFilterDisabled,
  isFilterLoading,
  isLoading,
  isSelectAllDisabled,
  isShowSelectedOnlyDisabled,
  loadingLabel,
  minPageSize,
  noItemsText = 'No items found',
  onClear,
  onFilterTextChange,
  onPageChange,
  onPageSizeChange,
  onSelectAll,
  onShowSelectedOnlyChange,
  onToggle,
  pageSize,
  pageSizes,
  paginatedRows,
  selectedCount,
  selectionLabel = 'Selected:',
  selectionMap,
  showEmptyState,
  showPagination,
  showSelectedOnly,
  showToolbar = true,
  totalCount,
}: SelectionPanelProps) => {
  const isSmUp = useBreakpoint('up', 'sm');

  const handlePaginationPageChange = (e: CustomEvent<unknown>) => {
    if (typeof e.detail === 'number') {
      onPageChange(e.detail);
    }
  };

  const handlePaginationPageSizeChange = (e: CustomEvent<unknown>) => {
    const detail = e.detail;
    if (
      typeof detail === 'object' &&
      detail !== null &&
      'pageSize' in detail &&
      typeof detail.pageSize === 'number'
    ) {
      onPageSizeChange(detail.pageSize);
    }
  };

  const dividerStyle: React.CSSProperties = {
    background:
      'var(--token-component-divider-border, light-dark(#d6d6dd, #515157))',
    flexShrink: 0,
    height: '24px',
    width: '1px',
  };

  const shouldShowPagination = showPagination ?? totalCount > minPageSize;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <SearchField
        disabled={isFilterDisabled}
        isLoading={isFilterLoading}
        onChange={(e) => {
          const target = e.target as HTMLInputElement | null;
          onFilterTextChange(target?.value ?? '');
        }}
        placeholder={filterPlaceholder}
        style={{
          margin: `${Spacing.S12} 0`,
          width: '100%',
        }}
        value={filterText}
      />

      {showToolbar && (
        <div
          style={{
            alignItems: 'center',
            borderTop: isSmUp
              ? `1px solid var(--token-component-pagination-border, light-dark(#d6d6dd, #515157))`
              : 0,
            display: 'flex',
            flexWrap: isSmUp ? 'nowrap' : 'wrap',
            fontSize: Font.FontSize.Xs,
            gap: Spacing.S12,
            minHeight: '40px',
            padding: `${Spacing.S4} ${Spacing.S12}`,
          }}
        >
          <Checkbox
            checked={showSelectedOnly}
            disabled={isShowSelectedOnlyDisabled}
            onChange={(e) => {
              onShowSelectedOnlyChange(Boolean(e.detail));
            }}
            size="small"
            style={{
              flexShrink: 0,
              order: isSmUp ? 1 : 0,
              width: isSmUp ? 'auto' : '100%',
            }}
          >
            Show selected only
          </Checkbox>

          <div
            style={{
              alignItems: 'baseline',
              display: 'flex',
              flex: isSmUp ? 1 : undefined,
              gap: Spacing.S8,
              justifyContent: 'space-between',
              minWidth: 0,
              order: isSmUp ? 0 : 1,
              width: '100%',
            }}
          >
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: isSmUp ? Spacing.S8 : undefined,
                maxWidth: 'max-content',
                width: '100%',
              }}
            >
              <span
                style={{
                  maxWidth: 'max-content',
                }}
              >
                {selectionLabel} {selectedCount}/
                {showSelectedOnly ? selectedCount : totalCount}
              </span>
              {isSmUp && <div style={dividerStyle} />}
            </div>

            <div
              style={{
                display: 'flex',
                gap: isSmUp ? Spacing.S8 : Spacing.S16,
                justifyContent: isSmUp ? 'flex-start' : 'flex-end',
                width: '100%',
              }}
            >
              <Button
                disabled={isSelectAllDisabled}
                onClick={onSelectAll}
                type="button"
                variant="link"
              >
                Select all
              </Button>
              {isSmUp && <div style={dividerStyle} />}
              <Button
                disabled={isClearDisabled}
                onClick={onClear}
                type="button"
                variant="link"
              >
                Clear all
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <Table
          style={{
            borderTop: `1px solid var(--token-component-pagination-border, light-dark(#d6d6dd, #515157))`,
          }}
        >
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell style={{ justifyContent: 'center' }}>
                  <CircleProgress label={loadingLabel} />
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((p) => (
                <TableRow
                  hoverable
                  key={p.rank}
                  onClick={(e: React.MouseEvent) => {
                    if (isDisabled) return;
                    const t = e.target as Element;
                    if (t.closest?.('cds-checkbox')) return;
                    onToggle(p.rank, !selectionMap[p.rank]);
                  }}
                  rowborder
                  selected={!!selectionMap[p.rank]}
                >
                  <TableCell style={{ gap: 0, paddingLeft: 0 }}>
                    <Checkbox
                      checked={!!selectionMap[p.rank]}
                      disabled={isDisabled}
                      onChange={(e) => {
                        onToggle(p.rank, Boolean(e.detail));
                      }}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      size="small"
                    />
                    <span
                      style={{
                        flex: 1,
                        lineHeight: '20px',
                        minWidth: 0,
                        marginLeft: `-${Spacing.S8}`,
                      }}
                    >
                      {p.name}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
            {showEmptyState && (
              <TableRow>
                <TableCell style={{ justifyContent: 'center' }}>
                  {noItemsText}
                </TableCell>
              </TableRow>
            )}
            {errorText && (
              <TableRow>
                <TableCell style={{ justifyContent: 'center' }}>
                  {errorText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {shouldShowPagination && (
          <Pagination
            count={totalCount}
            onPageChange={handlePaginationPageChange}
            onPageSizeChange={handlePaginationPageSizeChange}
            page={effectivePage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            style={{ borderTop: 0 }}
          />
        )}
      </div>
    </div>
  );
};
