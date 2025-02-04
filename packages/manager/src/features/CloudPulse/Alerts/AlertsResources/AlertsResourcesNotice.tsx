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
      <StyledNotice
        sx={{
          height: '54px',
        }}
        variant="info"
      >
        <Typography data-testid="selection_notice">
          {selectedResources} of {totalResources} resources are selected.{' '}
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
  '&&': {
    p: {
      lineHeight: '1.25rem',
    },
  },
  alignItems: 'center',
  background: theme.bg.bgPaper,
  borderRadius: 1,
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(0),
  padding: theme.spacing(2),
}));

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
