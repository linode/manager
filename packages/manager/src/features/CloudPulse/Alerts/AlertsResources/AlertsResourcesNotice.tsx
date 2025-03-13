import { Button, Notice, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import type { SelectDeselectAll } from './AlertsResources';

interface AlertResourceNoticeProps {
  /**
   * Callback to handle selection changes (select all or deselect all).
   */
  handleSelectionChange: (action: SelectDeselectAll) => void;

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

        <Button
          aria-label={
            isSelectAll ? 'Select All Resources' : 'Deselect All Resources'
          }
          data-testid={
            isSelectAll ? 'select_all_notice' : 'deselect_all_notice'
          }
          onClick={() => {
            handleSelectionChange(isSelectAll ? 'Select All' : 'Deselect All');
          }}
          sx={{
            p: 0,
          }}
        >
          {isSelectAll ? 'Select All' : 'Deselect All'}
        </Button>
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
