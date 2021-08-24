import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CloseTicketLink from '../CloseTicketLink';
import { makeStyles } from 'src/components/core/styles';

const useStyles = makeStyles(() => ({
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  isSubmitting: boolean;
  closeTicketSuccess: () => void;
  value: string;
  submitForm: (value: string) => void;
  closable: boolean;
  ticketId: number;
}

type CombinedProps = Props;

const ReplyActions: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    isSubmitting,
    submitForm,
    closeTicketSuccess,
    closable,
    value,
    ticketId,
  } = props;

  const handleSubmitForm = () => {
    submitForm(value);
  };

  return (
    <>
      {closable && (
        <CloseTicketLink
          ticketId={ticketId}
          closeTicketSuccess={closeTicketSuccess}
        />
      )}
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

export default React.memo(ReplyActions);
