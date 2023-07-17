import { makeStyles } from '@mui/styles';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';

import { CloseTicketLink } from '../CloseTicketLink';

const useStyles = makeStyles(() => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  closable: boolean;
  isSubmitting: boolean;
  submitForm: (value: string) => void;
  ticketId: number;
  value: string;
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
