import { Button, Notice, Tooltip, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { AlertMaxSelectionText } from './AlertMaxSelectionText';

import type { SelectDeselectAll } from './AlertsResources';

interface AlertResourceNoticeProps {
  /**
   * Callback to handle selection changes (select all or deselect all).
   */
  handleSelectionChange: (action: SelectDeselectAll) => void;

  /**
   * The maximum number of resources that can be selected based on service type.
   */
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
    const isSelectAll =
      maxSelectionCount !== undefined
        ? selectedResources === 0
        : selectedResources < totalResources;
    const buttonText = isSelectAll ? 'Select All' : 'Deselect All';
    const isButtonDisabled =
      isSelectAll && maxSelectionCount !== undefined
        ? totalResources > maxSelectionCount
        : false;

    return (
      <StyledNotice gap={1} variant="info">
        <Typography
          data-testid="selection_notice"
          sx={(theme) => ({
            fontFamily: theme.tokens.alias.Typography.Body.Bold,
          })}
        >
          {selectedResources} of {totalResources} entities are selected.
        </Typography>
        <Tooltip
          placement="right-start"
          slotProps={{
            tooltip: {
              sx: {
                maxWidth: '250px',
              },
            },
          }}
          title={
            isButtonDisabled && maxSelectionCount !== undefined ? (
              <AlertMaxSelectionText maxSelectionCount={maxSelectionCount} />
            ) : undefined
          }
        >
          <Button
            data-testid={
              isSelectAll ? 'select_all_notice' : 'deselect_all_notice'
            }
            disabled={isButtonDisabled}
            onClick={() => handleSelectionChange(buttonText)}
            sx={{ p: 0 }}
          >
            {buttonText}
          </Button>
        </Tooltip>
      </StyledNotice>
    );
  }
);

export const StyledNotice = styled(Notice, { label: 'StyledNotice' })(
  ({ theme }) => ({
    alignItems: 'center',
    background: theme.tokens.alias.Background.Normal,
    borderRadius: 1,
    display: 'flex',
    flexWrap: 'nowrap',
    marginBottom: 0,
    padding: theme.tokens.spacing.S16,
  })
);
