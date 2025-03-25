import { Button, Notice, Tooltip, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import type { SelectDeselectAll } from './AlertsResources';

interface AlertResourceNoticeProps {
  /**
   * Callback to handle selection changes (select all or deselect all).
   */
  handleSelectionChange: (action: SelectDeselectAll) => void;

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
      maxSelectionCount = Number.MAX_VALUE,
      selectedResources,
      totalResources,
    } = props;
    const isSelectAll = selectedResources === 0;
    const buttonText = isSelectAll ? 'Select All' : 'Deselect All';
    const isButtonDisabled = isSelectAll && totalResources > maxSelectionCount;

    return (
      <StyledNotice gap={1} variant="info">
        <Typography
          sx={(theme) => ({
            fontFamily: theme.tokens.alias.Typography.Body.Bold,
          })}
          data-testid="selection_notice"
        >
          {selectedResources} of {totalResources} resources are selected.
        </Typography>
        <Tooltip
          title={
            isButtonDisabled ? (
              <Typography
                sx={{
                  fontSize: '12px',
                }}
              >
                {`You can select upto ${maxSelectionCount} resources.`}
              </Typography>
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
