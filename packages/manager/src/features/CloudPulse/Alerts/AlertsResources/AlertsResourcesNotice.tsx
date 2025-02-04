import { Button, Notice, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

interface AlertResourceNoticeProps {
  handleSelectionChange: () => void;
  selectedResources: number;
  totalResources: number;
}

export const AlertsResourcesNotice = React.memo(
  (props: AlertResourceNoticeProps) => {
    const { handleSelectionChange, selectedResources, totalResources } = props;

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
        {selectedResources !== totalResources && (
          <StyledButton
            aria-label="Select All Resources"
            data-testid="select_all_notice"
            onClick={handleSelectionChange}
            variant="text"
          >
            Select All
          </StyledButton>
        )}
        {selectedResources === totalResources && (
          <StyledButton
            aria-label="Unselect All Resources"
            data-testid="unselect_all_notice"
            onClick={handleSelectionChange}
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
