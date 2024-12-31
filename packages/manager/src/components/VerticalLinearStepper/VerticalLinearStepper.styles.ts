import { omittedProps } from '@linode/ui';
import { StepConnector, StepIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

type StyledCircleIconProps = {
  activeStep: number;
  index: number;
};

export const StyledCircleIcon = styled('div', {
  label: 'StyledCircleIcon',
  shouldForwardProp: omittedProps(['activeStep', 'index']),
})<StyledCircleIconProps>(({ theme, ...props }) => ({
  alignItems: 'center',
  backgroundColor:
    props.index === props.activeStep
      ? theme.palette.primary.main
      : props.index < props.activeStep
      ? theme.tokens.color.Cyan[30] // TODO: need UX confirmation on color code
      : theme.bg.bgPaper, // Adjust colors as needed
  border:
    props.index < props.activeStep || props.index === props.activeStep
      ? `2px solid ${theme.palette.primary.main}`
      : `2px solid ${theme.borderColors.borderTable}`, // Adjust border styles as needed
  borderRadius: '50%',
  display: 'flex',
  height: theme.spacing(3),
  justifyContent: 'center',
  width: theme.spacing(3),
}));

export const CustomStepIcon = styled(StepIcon, { label: 'StyledCircleIcon' })(
  () => ({
    active: {},
    completed: {},
    root: {
      '&$completed': {
        display: 'none', // Hide the checkmark icon on completed steps
      },
    },
  })
);

export const StyledColorlibConnector = styled(StepConnector, {
  label: 'StyledColorlibConnector',
})(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: theme.tokens.color.Ultramarine[10],
    borderLeftWidth: '3px',
    minHeight: theme.spacing(2),
  },
}));
