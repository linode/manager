import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { CloseTicketLink } from '../CloseTicketLink';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  isSubmitting: boolean;
  value: string;
  submitForm: (value: string) => void;
  closable: boolean;
  ticketId: number;
}

export const ReplyActions = (props: Props) => {
  const classes = useStyles();

  const { isSubmitting, submitForm, closable, value, ticketId } = props;

  const handleSubmitForm = () => {
    submitForm(value);
  };

  return (
    <>
      {closable && <CloseTicketLink ticketId={ticketId} />}
      <ActionsPanel
        className={classes.actions}
        primary
        primaryButtonHandler={handleSubmitForm}
        primaryButtonLoading={isSubmitting}
        primaryButtonText="Add Update"
      />
    </>
  );
};
