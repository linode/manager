import type { TextFieldProps } from '@linode/ui';

/**
 * Shared text field props for CloudPulse components
 * Provides consistent scrollbar hiding and height constraints
 */
export const CloudPulseTextFieldProps: Partial<TextFieldProps> = {
  InputProps: {
    sx: {
      '::-webkit-scrollbar': {
        display: 'none',
      },
      maxHeight: '55px',
      msOverflowStyle: 'none',
      overflow: 'auto',
      scrollbarWidth: 'none',
    },
  },
};
