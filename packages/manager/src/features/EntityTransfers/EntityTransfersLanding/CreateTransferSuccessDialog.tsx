import { EntityTransfer } from '@linode/api-v4/lib/entity-transfers/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import copy from 'copy-to-clipboard';
import { DateTime } from 'luxon';
import { update } from 'ramda';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import { Button } from 'src/components/Button/Button';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import {
  sendEntityTransferCopyDraftEmailEvent,
  sendEntityTransferCopyTokenEvent,
} from 'src/utilities/analytics';
import { parseAPIDate } from 'src/utilities/date';
import { pluralize } from 'src/utilities/pluralize';

const debouncedSendEntityTransferCopyTokenEvent = debounce(
  10 * 1000,
  true,
  sendEntityTransferCopyTokenEvent
);

const debouncedSendEntityTransferDraftEmailEvent = debounce(
  10 * 1000,
  true,
  sendEntityTransferCopyDraftEmailEvent
);

const useStyles = makeStyles((theme: Theme) => ({
  copyButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing(2),
    maxWidth: 220,
  },
  inputSection: {
    display: 'flex',
    flexFlow: 'column nowrap',
    paddingBottom: theme.spacing(1),
  },
  root: {
    paddingBottom: theme.spacing(),
  },
  text: {
    marginBottom: theme.spacing(),
  },
  tokenInput: {
    maxWidth: '100%',
  },
}));

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transfer?: EntityTransfer;
}

export const CreateTransferSuccessDialog = React.memo((props: Props) => {
  const { isOpen, onClose, transfer } = props;
  const [tooltipOpen, setTooltipOpen] = React.useState([false, false]);
  const classes = useStyles();

  const handleCopy = (idx: number, text: string) => {
    copy(text);
    setTooltipOpen((state) => update(idx, true, state));
    setTimeout(
      () => setTooltipOpen((state) => update(idx, false, state)),
      1000
    );
  };

  if (!transfer) {
    // This isn't possible; just to reassure TS
    return null;
  }

  const pluralizedEntities = pluralize(
    'Linode',
    'Linodes',
    transfer.entities.linodes.length
  );

  const draftEmail = `This token authorizes transfer of ${pluralizedEntities} to you:\n
${transfer.token}\n\t
1) Log in to your account at cloud.linode.com.\t
2) Navigate to the Service Transfers tab on your Account page.\t
3) Copy and paste the token into the Receive a Service Transfer field to view\tdetails and accept the transfer.\n
If you do not have an account with Linode you will need to create one.
This token will expire ${parseAPIDate(transfer.expiry).toLocaleString(
    DateTime.DATETIME_FULL
  )}.`;

  return (
    <Dialog
      className={classes.root}
      onClose={onClose}
      open={isOpen}
      title="Service Transfer Token"
    >
      <Typography className={classes.text}>
        This token authorizes the transfer of {pluralizedEntities}.
      </Typography>
      <Typography>
        Copy and paste the token or draft text into an email or other secure
        delivery method. It may take up to an hour for the service transfer to
        take effect once accepted by the recipient.
      </Typography>
      <div className={classes.inputSection}>
        <CopyableTextField
          aria-disabled
          className={classes.tokenInput}
          fullWidth
          hideIcon
          label="Token"
          value={transfer.token}
        />
        <Tooltip open={tooltipOpen[0]} title="Copied!">
          <div className={classes.copyButton}>
            <Button
              onClick={() => {
                // @analytics
                debouncedSendEntityTransferCopyTokenEvent();
                handleCopy(0, transfer.token);
              }}
              buttonType="outlined"
            >
              Copy Token
            </Button>
          </div>
        </Tooltip>
      </div>
      <div className={classes.inputSection}>
        <CopyableTextField
          aria-disabled
          className={classes.tokenInput}
          fullWidth
          hideIcon
          label="Draft Email"
          multiline
          value={draftEmail}
        />
        <Tooltip open={tooltipOpen[1]} title="Copied!">
          <div className={classes.copyButton}>
            <Button
              onClick={() => {
                // @analytics
                debouncedSendEntityTransferDraftEmailEvent();
                handleCopy(1, draftEmail);
              }}
              buttonType="primary"
            >
              Copy Draft Email
            </Button>
          </div>
        </Tooltip>
      </div>
    </Dialog>
  );
});
