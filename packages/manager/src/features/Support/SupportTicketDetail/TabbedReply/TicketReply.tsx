import * as React from 'react';

import { TextField } from 'src/components/TextField';

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
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(e.target.value)
      }
      data-qa-ticket-description
      errorText={error}
      expand
      hideLabel
      label="Enter your reply"
      multiline
      placeholder={placeholder || 'Enter your reply'}
      rows={1.8}
      value={value}
    />
  );
};
