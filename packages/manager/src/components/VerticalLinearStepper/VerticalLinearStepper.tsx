import {
  Step,
  StepConnector,
  StepContent,
  StepIcon,
  StepLabel,
  Stepper,
} from '@mui/material';
import Box from '@mui/material/Box';
import { Theme, styled } from '@mui/material/styles';
import React, { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

type VerticalLinearStep = {
  content: JSX.Element;
  handler?: () => void;
  label: string;
};

interface VerticalLinearStepperProps {
  steps: VerticalLinearStep[];
}

const ColorlibConnector = () => (
  <StepConnector
    sx={{
      '& .MuiStepConnector-line': {
        borderColor: '#eaeaf0',
        borderLeftWidth: '3px',
        minHeight: '28px',
      },
    }}
  />
);

const CustomStepIcon = styled(StepIcon)(() => ({
  active: {},
  completed: {},
  root: {
    '&$completed': {
      display: 'none', // Hide the checkmark icon on completed steps
    },
  },
}));

type IconStyles = {
  backgroundColor?: string;
  border?: string;
};

const CircleIcon = ({ iconStyles }: { iconStyles: IconStyles }) => (
  <div
    style={{
      alignItems: 'center',
      borderRadius: '50%',
      display: 'flex',
      height: '24px',
      justifyContent: 'center',
      width: '24px',
      ...iconStyles,
    }}
  >
    {/* You can also add any content inside the circle if needed */}
  </div>
);

export const VerticalLinearStepper = ({
  steps,
}: VerticalLinearStepperProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getCircleIconStyles = (index: number, activeStep: number) => {
    if (index === activeStep) {
      return { backgroundColor: '#3683dc' }; // Current step
    } else if (index < activeStep) {
      return { backgroundColor: '#ADD8E6', border: '2px solid #3683dc' }; // Completed step
    } else {
      return { backgroundColor: 'white', border: '2px solid #f4f5f6' }; // Inactive step
    }
  };

  return (
    <Box
      sx={(theme: Theme) => ({
        backgroundColor: 'white',
        display: 'flex',
        margin: 'auto',
        maxWidth: 800,
        p: `${theme.spacing(2)}`,
      })}
    >
      {/* Left Column - Vertical Steps */}
      <Box>
        <Stepper
          activeStep={activeStep}
          connector={<ColorlibConnector />}
          orientation="vertical"
        >
          {steps.map((step: VerticalLinearStep, index: number) => (
            <Step key={step.label}>
              <StepLabel
                icon={
                  <CustomStepIcon
                    icon={
                      <CircleIcon
                        iconStyles={getCircleIconStyles(index, activeStep)}
                      />
                    }
                  />
                }
                sx={{
                  '& .MuiStepIcon-text': {
                    display: 'none',
                  },
                  p: 0,
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      {/* Right Column - Stepper Content */}
      <Box sx={{ flex: 2 }}>
        <Stepper
          connector={
            <StepConnector
              sx={{
                '& .MuiStepConnector-line': {
                  display: 'none',
                },
                '& .MuiStepConnector-vertical': {
                  display: 'none',
                },
              }}
            />
          }
          activeStep={activeStep}
          orientation="vertical"
        >
          {steps.map(({ content, handler, label }, index) => (
            <Step key={label}>
              {index === activeStep ? (
                <StepContent sx={{ border: 'none' }}>
                  <Box
                    sx={(theme) => ({
                      bgcolor: theme.bg.app,
                      p: theme.spacing(2),
                    })}
                  >
                    {content}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <ActionsPanel
                      primaryButtonProps={
                        index !== 2
                          ? {
                              'data-testid': label,
                              label: `Next: ${steps[index + 1]?.label}`,
                              onClick: () => {
                                handleNext();
                                handler?.();
                              },
                              sx: { mr: 1, mt: 1 },
                            }
                          : undefined
                      }
                      secondaryButtonProps={
                        index !== 0
                          ? {
                              buttonType: 'outlined',
                              label: `Previous: ${steps[index - 1]?.label}`,
                              onClick: handleBack,
                              sx: { mr: 1, mt: 1 },
                            }
                          : undefined
                      }
                      style={{ justifyContent: 'flex-start' }}
                    />
                  </Box>
                </StepContent>
              ) : null}
            </Step>
          ))}
        </Stepper>
      </Box>
    </Box>
  );
};
