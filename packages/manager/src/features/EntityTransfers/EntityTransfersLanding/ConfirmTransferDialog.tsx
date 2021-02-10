import * as React from 'react';
import Dialog from 'src/components/Dialog';

// import { makeStyles, Theme } from 'src/components/core/styles';

// const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {
  onClose: () => void;
  open: boolean;
  token?: string;
}

export type CombinedProps = Props;

export const ConfirmTransferDialog: React.FC<Props> = props => {
  const { onClose, open, token } = props;
  return (
    <Dialog onClose={onClose} title="Confirm Transfer" open={open}>
      You entered token: {token}
    </Dialog>
  );
};

export default React.memo(ConfirmTransferDialog);
