import { Button, convertToKebabCase } from '@linode/ui';
import {
  Step,
  StepConnector,
  StepContent,
  StepLabel,
  Stepper,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';

import {
  CustomStepIcon,
  StyledCircleIcon,
  StyledColorlibConnector,
} from './VerticalLinearStepper.styles';

import type { Theme } from '@mui/material/styles';

type VerticalLinearStep = {
  content: JSX.Element;
  handler?: () => void;
  label: string;
};

export interface VerticalLinearStepperProps {
  steps: VerticalLinearStep[];
}

export const VerticalLinearStepper = ({
  steps,
}: VerticalLinearStepperProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme<Theme>();

  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

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
        flexDirection: matchesSmDown ? 'column' : 'row',
        p: matchesSmDown ? `${theme.spacing(2)}px 0px` : `${theme.spacing(2)}`,
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
            <Step key={step.label} onClick={() => setActiveStep(index)}>
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
                  cursor: 'pointer !important',
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
          activeStep={activeStep}
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
          orientation="vertical"
        >
          {steps.map(({ content, handler, label }, index) => (
            <Step key={label}>
              {index === activeStep ? (
                <StepContent
                  sx={{
                    border: 'none',
                    marginLeft: matchesSmDown ? '0px' : undefined,
                    paddingLeft: matchesSmDown ? '0px' : undefined,
                    paddingTop: matchesSmDown
                      ? `${theme.spacing(2)}`
                      : undefined,
                  }}
                >
                  <Box
                    sx={(theme) => ({
                      bgcolor: theme.bg.app,
                      p: theme.spacing(2),
                    })}
                  >
                    {content}
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {index !== 0 && (
                      <Button
                        buttonType={'outlined'}
                        onClick={handleBack}
                        sx={{ mr: 1, mt: 1 }}
                      >
                        Previous: {steps[index - 1]?.label}
                      </Button>
                    )}
                    {index !== 2 && (
                      <Button
                        buttonType="primary"
                        /* Generate a 'data-testid' attribute value based on the label of the next step.
                            1. toLocaleLowerCase(): Converts the label to lowercase for consistency.
                            2. replace(/\s/g, ''): Removes spaces from the label to create a valid test ID.
                        */
                        data-testid={convertToKebabCase(
                          steps[index + 1]?.label
                        )}
                        onClick={() => {
                          handleNext();
                          handler?.();
                        }}
                        sx={{ mr: 1, mt: 1 }}
                      >
                        Next: {steps[index + 1]?.label}
                      </Button>
                    )}
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
