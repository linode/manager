import { Notice, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { LinkButton } from 'src/components/LinkButton';

import type { SelectUnselectAll } from './AlertsResources';

interface AlertResourceNoticeProps {
  /**
   * Callback to handle selection changes (select all or unselect all).
   */
  handleSelectionChange: (action: SelectUnselectAll) => void;

  /**
   * The number of currently selected resources.
   */
  selectedResources: number;

  /**
   * The total number of available resources.
   */
  totalResources: number;
}

export const AlertsResourcesNotice = React.memo(
  (props: AlertResourceNoticeProps) => {
    const { handleSelectionChange, selectedResources, totalResources } = props;
    const isSelectAll = selectedResources !== totalResources;

    return (
      <StyledNotice gap={1} variant="info">
        <Typography
          sx={(theme) => ({
            fontFamily: theme.font.bold,
          })}
          data-testid="selection_notice"
          variant="body2"
        >
          {selectedResources} of {totalResources} resources are selected.
        </Typography>
        {isSelectAll && (
          <LinkButton
            onClick={() => {
              handleSelectionChange('Select All');
            }}
            aria-label="Select All Resources"
            data-testid="select_all_notice"
          >
            Select All
          </LinkButton>
        )}
        {!isSelectAll && (
          <LinkButton
            onClick={() => {
              handleSelectionChange('Unselect All');
            }}
            aria-label="Unselect All Resources"
            data-testid="unselect_all_notice"
          >
            Unselect All
          </LinkButton>
        )}
      </StyledNotice>
    );
  }
);

const StyledNotice = styled(Notice, { label: 'StyledNotice' })(({ theme }) => ({
  alignItems: 'center',
  background: theme.tokens.background.Normal,
  borderRadius: 1,
  display: 'flex',
  flexWrap: 'nowrap',
  marginBottom: 0,
  padding: theme.spacing(2),
}));
