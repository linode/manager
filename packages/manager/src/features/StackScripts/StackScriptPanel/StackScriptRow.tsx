import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { Typography } from 'src/components/Typography';
import { StackScriptActionMenu } from 'src/features/StackScripts/StackScriptPanel/StackScriptActionMenu';
import { StackScriptCategory } from 'src/features/StackScripts/stackScriptUtils';

import {
  StyledImagesTableCell,
  StyledLabelSpan,
  StyledLink,
  StyledRowTableCell,
  StyledTableRow,
  StyledTitleTableCell,
  StyledTitleTypography,
  StyledTypography,
  StyledUsernameSpan,
} from '../CommonStackScript.styles';

export interface Props {
  canAddLinodes: boolean;
  canModify: boolean;
  // change until we're actually using it.
  category: StackScriptCategory | string;
  deploymentsTotal: number;
  description: string;
  images: string[];
  isPublic: boolean;
  label: string;
  stackScriptID: number;
  stackScriptUsername: string;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  updated: string;
}

export const StackScriptRow = (props: Props) => {
  const {
    canAddLinodes,
    canModify,
    category,
    deploymentsTotal,
    description,
    images,
    isPublic,
    label,
    stackScriptID,
    stackScriptUsername,
    triggerDelete,
    triggerMakePublic,
    updated,
  } = props;

  const communityStackScript = category === 'community';

  const renderLabel = () => {
    return (
      <>
        <StyledLink to={`/stackscripts/${stackScriptID}`}>
          <StyledTitleTypography variant="h3">
            {stackScriptUsername && (
              <StyledUsernameSpan>
                {stackScriptUsername} /&nbsp;
              </StyledUsernameSpan>
            )}
            <StyledLabelSpan>{label}</StyledLabelSpan>
          </StyledTitleTypography>
        </StyledLink>
        {description && (
          <StyledTypography variant="body1">{description}</StyledTypography>
        )}
      </>
    );
  };

  return (
    <StyledTableRow ariaLabel={label} data-qa-table-row={label}>
      <StyledTitleTableCell data-qa-stackscript-title>
        {renderLabel()}
      </StyledTitleTableCell>
      <TableCell>
        <Typography data-qa-stackscript-deploys>{deploymentsTotal}</Typography>
      </TableCell>
      <Hidden smDown>
        <TableCell>
          <Typography data-qa-stackscript-revision>{updated}</Typography>
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <StyledImagesTableCell data-qa-stackscript-images>
          {images.includes('any/all') ? 'Any/All' : images.join(',  ')}
        </StyledImagesTableCell>
      </Hidden>
      {communityStackScript ? null : ( // We hide the "Status" column in the "Community StackScripts" tab of the StackScripts landing page since all of those are public.
        <Hidden lgDown>
          <TableCell data-qa-stackscript-status>
            {isPublic ? 'Public' : 'Private'}
          </TableCell>
        </Hidden>
      )}
      <StyledRowTableCell actionCell>
        <StackScriptActionMenu
          canAddLinodes={canAddLinodes}
          canModify={canModify}
          category={category}
          isPublic={isPublic}
          stackScriptID={stackScriptID}
          stackScriptLabel={label}
          stackScriptUsername={stackScriptUsername}
          triggerDelete={triggerDelete}
          triggerMakePublic={triggerMakePublic}
        />
      </StyledRowTableCell>
    </StyledTableRow>
  );
};
