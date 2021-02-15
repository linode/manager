import { EntityTransfer } from '@linode/api-v4/lib/entity-transfers/types';
import * as copy from 'copy-to-clipboard';
import * as React from 'react';
import Button from 'src/components/Button';
import InformationDialog from 'src/components/InformationDialog';
import CopyableTextField from 'src/components/CopyableTextField';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { entityTransferFactory } from 'src/factories/entityTransfers';
import { DateTime } from 'luxon';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing()
  },
  tokenInput: {
    maxWidth: '100%'
  },
  copyButton: {
    marginTop: theme.spacing(2),
    maxWidth: 220,
    alignSelf: 'flex-end'
  },
  text: {
    marginBottom: theme.spacing()
  },
  inputSection: {
    display: 'flex',
    flexFlow: 'column nowrap',
    paddingBottom: theme.spacing(1)
  }
}));

interface Props {
  isOpen: boolean;
  transfer?: EntityTransfer;
  onClose: () => void;
}

const _transfer = entityTransferFactory.build();

export const CreateTransferSuccessDialog: React.FC<Props> = props => {
  const { isOpen, onClose } = props;
  const classes = useStyles();
  const transfer = _transfer;

  const draftEmail = `This token authorizes transfer of Linodes to you:\n
  ${transfer.token}\n\t
   1) Log in to your account on Linode Cloud Manager.\t
   2) Navigate to the Transfers tab on your Account page.\t
   3) Copy and paste the token into the Enter Transfer Token field to view\n\t details and accept the transfer.\n
   If you do not have an account with Linode you will need to create one.
   This token will expire at ${DateTime.fromISO(transfer.expiry)
     .toUTC()
     .toLocaleString(DateTime.DATETIME_FULL)}.`;

  return (
    <InformationDialog
      title="Token for Transfer"
      open={isOpen}
      onClose={onClose}
      className={classes.root}
    >
      <Typography className={classes.text}>
        This token authorizes the transfer of {600} Linodes.
      </Typography>
      <Typography>
        Copy and paste the transfer token or draft text into an email or other
        secure delivery method. It make take up to an hour for the transfer to
        take effect once accepted by the recipient.
      </Typography>
      <div className={classes.inputSection}>
        <CopyableTextField
          className={classes.tokenInput}
          value={transfer.token}
          label="Transfer Token"
          hideIcon
          fullWidth
          aria-disabled
        />
        <Button
          buttonType="primary"
          onClick={() => copy(transfer.token)}
          className={classes.copyButton}
        >
          Copy Transfer Token
        </Button>
      </div>
      <div className={classes.inputSection}>
        <CopyableTextField
          className={classes.tokenInput}
          value={draftEmail}
          label="Draft Email"
          hideIcon
          fullWidth
          aria-disabled
          multiline
        />
        <Button
          buttonType="primary"
          className={classes.copyButton}
          onClick={() => copy(draftEmail)}
        >
          Copy Draft Email
        </Button>
      </div>
    </InformationDialog>
  );
};

export default React.memo(CreateTransferSuccessDialog);
