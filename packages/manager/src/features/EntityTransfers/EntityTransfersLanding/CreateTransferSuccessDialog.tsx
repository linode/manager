import { Button, Tooltip, Typography } from '@linode/ui';
import { pluralize } from '@linode/utilities';
import copy from 'copy-to-clipboard';
import { DateTime } from 'luxon';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import {
  sendEntityTransferCopyDraftEmailEvent,
  sendEntityTransferCopyTokenEvent,
} from 'src/utilities/analytics/customEventAnalytics';
import { parseAPIDate } from 'src/utilities/date';

import {
  StyledCopyableTextField,
  StyledCopyDiv,
  StyledDialog,
  StyledInputDiv,
  StyledTypography,
} from './CreateTransferSuccessDialog.styles';

import type { EntityTransfer } from '@linode/api-v4/lib/entity-transfers/types';

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transfer?: EntityTransfer;
}

export const CreateTransferSuccessDialog = React.memo((props: Props) => {
  const { isOpen, onClose, transfer } = props;
  const [tooltipOpen, setTooltipOpen] = React.useState([false, false]);

  const handleCopy = (idx: number, text: string) => {
    copy(text);

    setTooltipOpen((prev) => {
      const newToolTipState = [...prev];
      newToolTipState[idx] = true;
      return newToolTipState;
    });

    setTimeout(
      () =>
        setTooltipOpen((prev) => {
          const newToolTipState = [...prev];
          newToolTipState[idx] = false;
          return newToolTipState;
        }),
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
    <StyledDialog
      onClose={onClose}
      open={isOpen}
      title="Service Transfer Token"
    >
      <StyledTypography>
        This token authorizes the transfer of {pluralizedEntities}.
      </StyledTypography>
      <Typography>
        Copy and paste the token or draft text into an email or other secure
        delivery method. It may take up to an hour for the service transfer to
        take effect once accepted by the recipient.
      </Typography>
      <StyledInputDiv>
        <StyledCopyableTextField
          aria-disabled
          fullWidth
          hideIcons
          label="Token"
          value={transfer.token}
        />
        <Tooltip open={tooltipOpen[0]} title="Copied!">
          <StyledCopyDiv>
            <Button
              buttonType="outlined"
              onClick={() => {
                // @analytics
                debouncedSendEntityTransferCopyTokenEvent();
                handleCopy(0, transfer.token);
              }}
            >
              Copy Token
            </Button>
          </StyledCopyDiv>
        </Tooltip>
      </StyledInputDiv>
      <StyledInputDiv>
        <StyledCopyableTextField
          aria-disabled
          fullWidth
          hideIcons
          label="Draft Email"
          multiline
          value={draftEmail}
        />
        <Tooltip open={tooltipOpen[1]} title="Copied!">
          <StyledCopyDiv>
            <Button
              buttonType="primary"
              onClick={() => {
                // @analytics
                debouncedSendEntityTransferDraftEmailEvent();
                handleCopy(1, draftEmail);
              }}
            >
              Copy Draft Email
            </Button>
          </StyledCopyDiv>
        </Tooltip>
      </StyledInputDiv>
    </StyledDialog>
  );
});
