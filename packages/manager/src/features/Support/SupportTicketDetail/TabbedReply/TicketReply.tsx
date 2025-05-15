import { TextField } from '@linode/ui';
import * as React from 'react';

export interface Props {
  error?: string;
  handleChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export const TicketReply = (props: Props) => {
  const { error, handleChange, placeholder, value } = props;

  return (
    <TextField
      data-qa-ticket-description
      errorText={error}
      expand
      hideLabel
      label="Enter your reply"
      multiline
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(e.target.value)
      }
      placeholder={placeholder || 'Enter your reply'}
      rows={1.8}
      value={value}
    />
  );
};
