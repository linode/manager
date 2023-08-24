import {
  Step,
  StepConnector,
  StepContent,
  StepLabel,
  Stepper,
} from '@mui/material';
import Box from '@mui/material/Box';
import { Theme } from '@mui/material/styles';
import React, { useState } from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';

import {
  CustomStepIcon,
  StyledCircleIcon,
  StyledColorlibConnector,
} from './VerticalLinearStepper.styles';

type VerticalLinearStep = {
  content: JSX.Element;
  handler?: () => void;
  label: string;
};

interface VerticalLinearStepperProps {
  steps: VerticalLinearStep[];
}

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

  return (
    <Box
      sx={(theme: Theme) => ({
        backgroundColor: theme.bg.bgPaper,
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
          connector={<StyledColorlibConnector />}
          orientation="vertical"
        >
          {steps.map((step: VerticalLinearStep, index: number) => (
            <Step key={step.label}>
              <StepLabel
                icon={
                  <CustomStepIcon
                    icon={
                      <StyledCircleIcon activeStep={activeStep} index={index} />
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
                              'data-testid': label.toLocaleLowerCase(),
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
