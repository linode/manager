import { LoadingSpinner } from '@akamai/cds-components/react/LoadingSpinner';
import * as React from 'react';

export interface CircleProgressProps {
  /**
   * Optional accessible label for the spinner.
   */
  label?: string;
  /**
   * The size of the spinner.
   * @default "extra-large"
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
  /**
   * Additional styles to apply to the root element.
   */
  style?: React.CSSProperties;
}

export const CircleProgress = ({
  label,
  size = 'extra-large',
  spinnerId,
  state = 'loading',
  style,
}: CircleProgressProps) => {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        height: 300,
        justifyContent: 'center',
        margin: '0 auto 20px',
        position: 'relative',
        width: '100%',
        ...style,
      }}
    >
      <LoadingSpinner
        data-testid="circle-progress"
        label={label}
        size={size}
        spinnerId={spinnerId}
        state={state}
      />
    </div>
  );
};
