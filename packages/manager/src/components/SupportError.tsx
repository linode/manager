import * as React from 'react';
import { APIError } from '@linode/api-v4/lib/types';
import Typography from 'src/components/core/Typography';
import SupportLink from 'src/components/SupportLink';
import { useStyles } from 'src/components/Notice/Notice';
interface Props {
  errors: APIError[];
}

export const SupportError: React.FC<Props> = (props) => {
  const { errors } = props;
  const errorMsg = errors[0].reason.split(/(open a support ticket)/i);
  const ticketLinkText =
    errorMsg[0].length === 0
      ? 'Open a support ticket'
      : 'open a support ticket';

  const classes = useStyles();

  return (
    <Typography className={classes.noticeText}>
      {errorMsg.map((substring: string) => {
        const openTicket = substring.match(/open a support ticket/i);
        if (openTicket) {
          return <SupportLink text={ticketLinkText} />;
        } else {
          return substring;
        }
      })}
    </Typography>
  );
};
