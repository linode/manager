import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CloseTicketLink from '../CloseTicketLink';

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
      <ActionsPanel style={{ marginTop: 8 }}>
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
