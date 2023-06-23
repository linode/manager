import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
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

  const { closable, isSubmitting, submitForm, ticketId, value } = props;

  const handleSubmitForm = () => {
    submitForm(value);
  };

  return (
    <>
      {closable && <CloseTicketLink ticketId={ticketId} />}
      <ActionsPanel className={classes.actions}>
        <Button
          buttonType="primary"
          loading={isSubmitting}
          onClick={handleSubmitForm}
        >
          Add Update
        </Button>
      </ActionsPanel>
    </>
  );
};
