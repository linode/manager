import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import TextField from 'src/components/TextField';

const useStyles = makeStyles({
  replyField: {
    marginTop: 0,
    '& > div': {
      maxWidth: '100% !important',
    },
  },
});

export interface Props {
  error?: string;
  handleChange: (value: string) => void;
  value: string;
  placeholder?: string;
}

const TicketReply = (props: Props) => {
  const { placeholder, value, handleChange, error } = props;
  const classes = useStyles();

  return (
    <TextField
      className={classes.replyField}
      multiline
      rows={12}
      value={value}
      placeholder={placeholder || 'Enter your reply'}
      data-qa-ticket-description
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(e.target.value)
      }
      errorText={error}
      label="Enter your reply"
      hideLabel
    />
  );
};

export default TicketReply;
