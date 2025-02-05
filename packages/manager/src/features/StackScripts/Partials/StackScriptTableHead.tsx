import { Theme } from '@mui/material/styles';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';

import {
  StyledCompatibleImagesCell,
  StyledEmptyTableCell,
  StyledRootTableHead,
  StyledStatusCell,
  sharedDeployCellStyles,
  sharedRevisionsCellStyles,
  sharedStackScriptCellStyles,
} from './StackScriptTableHead.styles';

type SortOrder = 'asc' | 'desc';

type CurrentFilter = 'deploys' | 'label' | 'revision';

export interface StackScriptTableHeadProps {
  category?: string;
  currentFilterType: CurrentFilter | null;
  handleClickTableHeader?: (value: string) => void;
  isSelecting?: boolean;
  sortOrder?: SortOrder;
}

export const StackScriptTableHead = (props: StackScriptTableHeadProps) => {
  const {
    category,
    currentFilterType,
    handleClickTableHeader,
    isSelecting,
    sortOrder,
  } = props;

  const Cell: React.ComponentType<any> =
    !!handleClickTableHeader && sortOrder ? TableSortCell : TableCell;

  const maybeAddSortingProps = (orderBy: string) =>
    !!handleClickTableHeader && sortOrder
      ? {
          active: currentFilterType === orderBy,
          direction: sortOrder,
          handleClick: handleClickTableHeader,
          label: orderBy,
        }
      : {};

  const communityStackScripts = category === 'community';

  return (
    <StyledRootTableHead>
      <TableRow>
        {/* The column width jumps in the Linode Create flow when the user
            clicks on the table header. This is currently also happening in
            production and might be related to the difference in width between
            the panels in the StackScript landing page and the one in the
            Linode Create flow.  */}
        <Cell
          sx={(theme: Theme) => ({
            ...sharedStackScriptCellStyles(category, isSelecting, theme),
          })}
          colSpan={isSelecting ? 2 : 1}
          data-qa-stackscript-table-header
          {...maybeAddSortingProps('label')}
        >
          StackScript
        </Cell>
        {!isSelecting && (
          <Cell
            data-qa-stackscript-active-deploy-header
            sx={(theme: Theme) => ({ ...sharedDeployCellStyles(theme) })}
            {...maybeAddSortingProps('deploys')}
          >
            Deploys
          </Cell>
        )}
        {!isSelecting && (
          <Hidden smDown>
            <Cell
              data-qa-stackscript-revision-header
              sx={(theme: Theme) => ({ ...sharedRevisionsCellStyles(theme) })}
              {...maybeAddSortingProps('revision')}
            >
              Last Revision
            </Cell>
          </Hidden>
        )}
        {!isSelecting && (
          <Hidden lgDown>
            <StyledCompatibleImagesCell
              category={category}
              data-qa-stackscript-compatible-images
            >
              Compatible Images
            </StyledCompatibleImagesCell>
          </Hidden>
        )}
        {!isSelecting && !communityStackScripts ? (
          <Hidden lgDown>
            <StyledStatusCell data-qa-stackscript-status-header>
              Status
            </StyledStatusCell>
          </Hidden>
        ) : null}
        {!isSelecting && <StyledEmptyTableCell />}
      </TableRow>
    </StyledRootTableHead>
  );
};
