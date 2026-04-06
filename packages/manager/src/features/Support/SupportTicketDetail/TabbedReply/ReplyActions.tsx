import { ActionsPanel } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { CloseTicketLink } from '../CloseTicketLink';

const useStyles = makeStyles()(() => ({
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
  const { classes } = useStyles();

  const { closable, isSubmitting, submitForm, ticketId, value } = props;

  const handleSubmitForm = () => {
    submitForm(value);
  };

  return (
    <>
      {closable && <CloseTicketLink ticketId={ticketId} />}
      <ActionsPanel
        className={classes.actions}
        primaryButtonProps={{
          label: 'Add Update',
          loading: isSubmitting,
          onClick: handleSubmitForm,
        }}
      />
    </>
  );
};
