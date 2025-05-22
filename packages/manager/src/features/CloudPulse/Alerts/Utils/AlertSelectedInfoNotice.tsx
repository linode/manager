import { Button, Notice, Tooltip, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { AlertMaxSelectionText } from './AlertMaxSelectionText';

import type { SelectDeselectAll } from '../constants';

interface AlertSelectedInforNoticeProps {
  /**
   * Callback to handle selection changes (select all or deselect all).
   */
  handleSelectionChange: (action: SelectDeselectAll) => void;

  /**
   * The maximum number of elements that can be selected.
   */
  maxSelectionCount?: number;

  /**
   * The property that is selected. Ex: regions, entities etc
   */
  property?: string;

  /**
   * The number of currently selected elements.
   */
  selectedCount: number;

  /**
   * The total number of available elements.
   */
  totalCount: number;
}

export const AlertSelectedInfoNotice = React.memo(
  (props: AlertSelectedInforNoticeProps) => {
    const {
      handleSelectionChange,
      maxSelectionCount,
      selectedCount,
      totalCount,
      property = 'enities',
    } = props;
    const isSelectAll =
      maxSelectionCount !== undefined
        ? selectedCount === 0
        : selectedCount < totalCount;
    const buttonText = isSelectAll ? 'Select All' : 'Deselect All';
    const isButtonDisabled =
      isSelectAll && maxSelectionCount !== undefined
        ? totalCount > maxSelectionCount
        : false;

    return (
      <StyledNotice gap={1} variant="info">
        <Typography
          data-testid="selection_notice"
          sx={(theme) => ({
            fontFamily: theme.tokens.alias.Typography.Body.Bold,
          })}
        >
          {selectedCount} of {totalCount} {property} are selected.
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
