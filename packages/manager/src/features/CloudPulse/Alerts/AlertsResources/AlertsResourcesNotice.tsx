import { Button, Notice, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import type { SelectUnselectAll } from './AlertsResources';

interface AlertResourceNoticeProps {
  /**
   * Callback to handle selection changes (select all or unselect all).
   */
  handleSelectionChange: (action: SelectUnselectAll) => void;

  maxSelectionCount?: number;

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
    const {
      handleSelectionChange,
      maxSelectionCount,
      selectedResources,
      totalResources,
    } = props;
    const isSelectAll = selectedResources === 0;

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
          <Button
            disabled={
              maxSelectionCount !== undefined &&
              totalResources > maxSelectionCount
            }
            onClick={() => {
              handleSelectionChange('Select All');
            }}
            sx={{
              margin: 0,
              padding: 0,
            }}
            aria-label="Select All Resources"
            data-testid="select_all_notice"
            variant="text"
          >
            Select All
          </Button>
        )}
        {!isSelectAll && (
          <Button
            onClick={() => {
              handleSelectionChange('Unselect All');
            }}
            sx={{
              margin: 0,
              padding: 0,
            }}
            aria-label="Unselect All Resources"
            data-testid="unselect_all_notice"
            variant="text"
          >
            Deselect All
          </Button>
        )}
      </StyledNotice>
    );
  }
);

export const StyledNotice = styled(Notice, { label: 'StyledNotice' })(
  ({ theme }) => ({
    alignItems: 'center',
    background: theme.tokens.background.Normal,
    borderRadius: 1,
    display: 'flex',
    flexWrap: 'nowrap',
    marginBottom: 0,
    padding: theme.spacing(2),
  })
);
