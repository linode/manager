import { StepConnector, StepIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

import { isPropValid } from 'src/utilities/isPropValid';

type StyledCircleIconProps = {
  activeStep: number;
  index: number;
};

export const StyledCircleIcon = styled('div', {
  label: 'StyledCircleIcon',
  shouldForwardProp: (prop) => isPropValid(['backgroundColor', 'border'], prop),
})<StyledCircleIconProps>(({ theme, ...props }) => ({
  alignItems: 'center',
  backgroundColor:
    props.index === props.activeStep
      ? theme.palette.primary.main
      : props.index < props.activeStep
      ? '#ADD8E6' // TODO: need UX confirmation on color code
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
})(() => ({
  '& .MuiStepConnector-line': {
    borderColor: '#eaeaf0',
    borderLeftWidth: '3px',
    minHeight: '28px',
  },
}));
