import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TableRow } from 'src/components/TableRow';

import {
  StyledCompatibleImagesCell,
  StyledDeployCell,
  StyledEmptyTableCell,
  StyledRevisionsCell,
  StyledRootTableHead,
  StyledSortedDeployCell,
  StyledSortedRevisionsCell,
  StyledSortedStackScriptCell,
  StyledStackScriptCell,
  StyledStatusCell,
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

  const DeploysCell: React.ComponentType<any> =
    !!handleClickTableHeader && sortOrder
      ? StyledSortedDeployCell
      : StyledDeployCell;

  const RevisionsCell: React.ComponentType<any> =
    !!handleClickTableHeader && sortOrder
      ? StyledSortedRevisionsCell
      : StyledRevisionsCell;

  const StackScriptCell: React.ComponentType<any> =
    !!handleClickTableHeader && sortOrder
      ? StyledSortedStackScriptCell
      : StyledStackScriptCell;

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
        <StackScriptCell
          category={category}
          colSpan={isSelecting ? 2 : 1}
          data-qa-stackscript-table-header
          {...maybeAddSortingProps('label')}
          isSelecting={isSelecting}
        >
          StackScript
        </StackScriptCell>
        {!isSelecting && (
          <DeploysCell
            data-qa-stackscript-active-deploy-header
            {...maybeAddSortingProps('deploys')}
          >
            Deploys
          </DeploysCell>
        )}
        {!isSelecting && (
          <Hidden smDown>
            <RevisionsCell
              data-qa-stackscript-revision-header
              {...maybeAddSortingProps('revision')}
            >
              Last Revision
            </RevisionsCell>
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
