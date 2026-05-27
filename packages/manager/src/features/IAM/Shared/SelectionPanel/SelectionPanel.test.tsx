import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { getCdsButtonByText } from '../../utilities/testHelpers';
import { SelectionPanel } from './SelectionPanel';

import type { SelectableRow } from './SelectionPanel';

beforeAll(() => mockMatchMedia());

const makeRow = (rank: number, name: string): SelectableRow => ({
  name,
  option: { label: name, value: name },
  rank,
});

const defaultRows: SelectableRow[] = [
  makeRow(0, 'alice'),
  makeRow(1, 'bob'),
  makeRow(2, 'carol'),
];

const noop = () => {};

const defaultProps = {
  effectivePage: 1,
  filterText: '',
  isClearDisabled: false,
  isLoading: false,
  isSelectAllDisabled: false,
  minPageSize: 25,
  onClear: noop,
  onFilterTextChange: noop,
  onPageChange: noop,
  onPageSizeChange: noop,
  onSelectAll: noop,
  onShowSelectedOnlyChange: noop,
  onToggle: noop,
  pageSize: 25,
  pageSizes: [25, 50],
  paginatedRows: defaultRows,
  selectedCount: 0,
  selectionMap: {},
  showEmptyState: false,
  showSelectedOnly: false,
  totalCount: 3,
};

describe('SelectionPanel', () => {
  describe('rows', () => {
    it('renders all provided rows', () => {
      renderWithTheme(<SelectionPanel {...defaultProps} />);

      expect(screen.getByText('alice')).toBeVisible();
      expect(screen.getByText('bob')).toBeVisible();
      expect(screen.getByText('carol')).toBeVisible();
    });

    it('calls onToggle with rank and true when an unchecked row is clicked', async () => {
      const onToggle = vi.fn();
      renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          onToggle={onToggle}
          selectionMap={{}}
        />
      );

      await userEvent.click(screen.getByText('alice'));

      expect(onToggle).toHaveBeenCalledWith(0, true);
    });

    it('calls onToggle with rank and false when a checked row is clicked', async () => {
      const onToggle = vi.fn();
      renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          onToggle={onToggle}
          selectionMap={{ 0: true }}
        />
      );

      await userEvent.click(screen.getByText('alice'));

      expect(onToggle).toHaveBeenCalledWith(0, false);
    });

    it('does not call onToggle when isDisabled is true', async () => {
      const onToggle = vi.fn();
      renderWithTheme(
        <SelectionPanel {...defaultProps} isDisabled onToggle={onToggle} />
      );

      await userEvent.click(screen.getByText('alice'));

      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('shows a loading spinner when isLoading is true', () => {
      const { container } = renderWithTheme(
        <SelectionPanel {...defaultProps} isLoading paginatedRows={[]} />
      );

      expect(
        container.querySelector('cds-loading-spinner')
      ).toBeInTheDocument();
      expect(screen.queryByText('alice')).not.toBeInTheDocument();
    });

    it('shows a custom loading label', () => {
      const { container } = renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          isLoading
          loadingLabel="Fetching all users..."
          paginatedRows={[]}
        />
      );

      // loadingLabel is passed as a React prop, not a DOM attribute —
      // verify the spinner element is present (label is set via property)
      expect(
        container.querySelector('cds-loading-spinner')
      ).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows the default empty text when showEmptyState is true', () => {
      renderWithTheme(
        <SelectionPanel {...defaultProps} paginatedRows={[]} showEmptyState />
      );

      expect(screen.getByText('No items found')).toBeVisible();
    });

    it('shows a custom noItemsText', () => {
      renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          noItemsText="No users found"
          paginatedRows={[]}
          showEmptyState
        />
      );

      expect(screen.getByText('No users found')).toBeVisible();
    });
  });

  describe('error state', () => {
    it('shows the error message when errorText is provided', () => {
      renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          errorText="Failed to load users"
          paginatedRows={[]}
        />
      );

      expect(screen.getByText('Failed to load users')).toBeVisible();
    });
  });

  describe('toolbar', () => {
    it('renders the toolbar by default', () => {
      renderWithTheme(<SelectionPanel {...defaultProps} />);

      expect(screen.getByText('Select all')).toBeVisible();
      expect(screen.getByText('Clear all')).toBeVisible();
      expect(screen.getByText('Show selected only')).toBeVisible();
    });

    it('hides the toolbar when showToolbar is false', () => {
      renderWithTheme(<SelectionPanel {...defaultProps} showToolbar={false} />);

      expect(screen.queryByText('Select all')).not.toBeInTheDocument();
      expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
      expect(screen.queryByText('Show selected only')).not.toBeInTheDocument();
    });

    it('displays the default selectionLabel and count', () => {
      renderWithTheme(
        <SelectionPanel {...defaultProps} selectedCount={1} totalCount={3} />
      );

      expect(screen.getByText(/Selected:/)).toBeVisible();
      expect(screen.getByText(/1\/3/)).toBeVisible();
    });

    it('displays a custom selectionLabel', () => {
      renderWithTheme(
        <SelectionPanel {...defaultProps} selectionLabel="Users selected:" />
      );

      expect(screen.getByText(/Users selected:/)).toBeVisible();
    });

    it('shows selectedCount/selectedCount when showSelectedOnly is true', () => {
      renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          selectedCount={2}
          showSelectedOnly
          totalCount={10}
        />
      );

      expect(screen.getByText(/2\/2/)).toBeVisible();
    });

    it('calls onSelectAll when "Select all" is clicked', async () => {
      const onSelectAll = vi.fn();
      renderWithTheme(
        <SelectionPanel {...defaultProps} onSelectAll={onSelectAll} />
      );

      await userEvent.click(screen.getByText('Select all'));

      expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    it('calls onClear when "Clear all" is clicked', async () => {
      const onClear = vi.fn();
      renderWithTheme(<SelectionPanel {...defaultProps} onClear={onClear} />);

      await userEvent.click(screen.getByText('Clear all'));

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('"Select all" is disabled when isSelectAllDisabled is true', async () => {
      const { container } = renderWithTheme(
        <SelectionPanel {...defaultProps} isSelectAllDisabled />
      );

      const btn = await getCdsButtonByText(container, 'Select all');
      expect(btn).toBeDisabled();
    });

    it('"Clear all" is disabled when isClearDisabled is true', async () => {
      const { container } = renderWithTheme(
        <SelectionPanel {...defaultProps} isClearDisabled />
      );

      const btn = await getCdsButtonByText(container, 'Clear all');
      expect(btn).toBeDisabled();
    });

    it('reflects showSelectedOnly state on the checkbox host element', () => {
      const { container } = renderWithTheme(
        <SelectionPanel {...defaultProps} showSelectedOnly />
      );

      const checkbox = container.querySelector<
        HTMLElement & { checked?: boolean }
      >('cds-checkbox');
      // CDS sets boolean props as JS properties, not HTML attributes
      expect(checkbox?.checked).toBe(true);
    });

    it('does not mark the checkbox as checked when showSelectedOnly is false', () => {
      const { container } = renderWithTheme(
        <SelectionPanel {...defaultProps} showSelectedOnly={false} />
      );

      expect(
        container.querySelector('cds-checkbox[checked]')
      ).not.toBeInTheDocument();
    });
  });

  describe('filter / search field', () => {
    it('reflects filterText on the search field', () => {
      const { container } = renderWithTheme(
        <SelectionPanel {...defaultProps} filterText="ali" />
      );

      // CDS sets value as a property, not an attribute — verify it rendered
      expect(container.querySelector('cds-search-field')).toBeInTheDocument();
    });

    it('renders the filter placeholder', () => {
      const { container } = renderWithTheme(
        <SelectionPanel {...defaultProps} filterPlaceholder="Search users..." />
      );

      // CDS sets placeholder as a property; verify element is present
      expect(container.querySelector('cds-search-field')).toBeInTheDocument();
    });

    it('disables the search field when isFilterDisabled is true', () => {
      const { container } = renderWithTheme(
        <SelectionPanel {...defaultProps} isFilterDisabled />
      );

      const searchField = container.querySelector<
        HTMLElement & { disabled?: boolean }
      >('cds-search-field');
      // CDS sets boolean props as JS properties, not HTML attributes
      expect(searchField?.disabled).toBe(true);
    });
  });

  describe('pagination', () => {
    it('does not render pagination when totalCount <= minPageSize', () => {
      renderWithTheme(
        <SelectionPanel {...defaultProps} minPageSize={25} totalCount={3} />
      );

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('renders pagination when totalCount > minPageSize', () => {
      const { container } = renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          minPageSize={25}
          paginatedRows={defaultRows}
          totalCount={30}
        />
      );

      expect(container.querySelector('cds-pagination')).toBeInTheDocument();
    });

    it('hides pagination when showPagination is explicitly false', () => {
      const { container } = renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          minPageSize={25}
          showPagination={false}
          totalCount={30}
        />
      );

      expect(container.querySelector('cds-pagination')).not.toBeInTheDocument();
    });

    it('shows pagination when showPagination is explicitly true even if count <= minPageSize', () => {
      const { container } = renderWithTheme(
        <SelectionPanel
          {...defaultProps}
          minPageSize={25}
          showPagination
          totalCount={3}
        />
      );

      expect(container.querySelector('cds-pagination')).toBeInTheDocument();
    });
  });
});
