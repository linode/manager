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
    const buttonText = isSelectAll ? 'Select All' : 'Deselect All';

    return (
      <StyledNotice gap={1} variant="info">
        <Typography
          sx={(theme) => ({
            fontFamily: theme.tokens.typography.Body.Bold,
          })}
          data-testid="selection_notice"
        >
          {selectedResources} of {totalResources} resources are selected.
        </Typography>
        <Button
          data-testid={
            isSelectAll ? 'select_all_notice' : 'deselect_all_notice'
          }
          onClick={() => handleSelectionChange(buttonText)}
          sx={{ p: 0 }}
        >
          {buttonText}
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
    padding: theme.tokens.spacing.S16,
  })
);
