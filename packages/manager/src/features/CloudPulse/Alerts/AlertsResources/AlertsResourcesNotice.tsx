import { Button, Notice, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

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
      <StyledNotice variant="info">
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
          <StyledButton
            aria-label="Select All Resources"
            data-testid="select_all_notice"
            onClick={() => handleSelectionChange('Select All')}
            variant="text"
          >
            Select All
          </StyledButton>
        )}
        {!isSelectAll && (
          <StyledButton
            aria-label="Unselect All Resources"
            data-testid="unselect_all_notice"
            onClick={() => handleSelectionChange('Unselect All')}
            variant="text"
          >
            Unselect All
          </StyledButton>
        )}
      </StyledNotice>
    );
  }
);

const StyledNotice = styled(Notice, { label: 'StyledNotice' })(({ theme }) => ({
  alignItems: 'center',
  background: theme.bg.bgPaper,
  borderRadius: 1,
  display: 'flex',
  flexWrap: 'nowrap',
  height: '54px',
  marginBottom: 0,
  padding: theme.spacing(2),
}));

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  marginLeft: theme.spacing(1),
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
