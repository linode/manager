import { TextField } from '@linode/ui';
import * as React from 'react';

export interface Props {
  descriptionFieldPendoId?: string;
  error?: string;
  handleChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export const TicketReply = (props: Props) => {
  const { descriptionFieldPendoId, error, handleChange, placeholder, value } =
    props;

  return (
    <TextField
      data-pendo-id={descriptionFieldPendoId}
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
