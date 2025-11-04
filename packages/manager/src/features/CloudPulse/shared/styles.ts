import type { TextFieldProps } from '@linode/ui';

/**
 * Shared text field props for CloudPulse components
 * Provides consistent scrollbar hiding and height constraints
 */
export const CLOUD_PULSE_TEXT_FIELD_PROPS: Partial<TextFieldProps> = {
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
