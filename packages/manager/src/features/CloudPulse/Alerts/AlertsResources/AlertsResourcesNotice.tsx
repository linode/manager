import { Button, Notice } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';

interface AlertResourceNoticeProps {
  handleSelectionChange: () => void;
  selectedResources: number;
  totalResources: number;
}

export const AlertsResourcesNotice = React.memo(
  (props: AlertResourceNoticeProps) => {
    const { handleSelectionChange, selectedResources, totalResources } = props;

    const theme = useTheme();
    return (
      <StyledNotice
        sx={{
          height: theme.spacing(6.75),
        }}
        variant="info"
      >
        <b>
          {selectedResources} of {totalResources} resources are selected.{' '}
        </b>
        {selectedResources !== totalResources && (
          <StyledButton
            aria-label="Select All Resources"
            onClick={handleSelectionChange}
            variant="text"
          >
            Select All
          </StyledButton>
        )}
        {selectedResources === totalResources && (
          <StyledButton
            aria-label="Unselect All Resources"
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
  flexFlow: 'row nowrap',
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
