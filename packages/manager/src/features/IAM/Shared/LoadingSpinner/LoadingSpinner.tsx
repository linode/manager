import { LoadingSpinner as CDSLoadingSpinner } from '@akamai/cds-components/react/LoadingSpinner';
import { styled } from '@mui/material/styles';
import * as React from 'react';

export interface LoadingSpinnerProps {
  /**
   * Optional accessible label for the spinner.
   */
  label?: string;
  /**
   * The size of the spinner.
   * @default "large"
   */
  size?: 'extra-large' | 'large' | 'medium' | 'small';
  /**
   * Unique identifier for the spinner element used for aria binding.
   */
  spinnerId?: string;
  /**
   * The current state of the spinner.
   * @default "loading"
   */
  state?: 'failure' | 'loading' | 'success';
}

export const LoadingSpinner = ({
  label,
  size = 'large',
  spinnerId,
  state = 'loading',
}: LoadingSpinnerProps) => {
  return (
    <StyledWrapper>
      <CDSLoadingSpinner
        data-testid="loading-spinner"
        label={label}
        size={size}
        spinnerId={spinnerId}
        state={state}
      />
    </StyledWrapper>
  );
};

const StyledWrapper = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  margin: '0 auto 20px',
  position: 'relative',
  flex: 1,
  height: 300,
  width: '100%',
}));
