import * as React from 'react';

import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { Typography } from 'src/components/Typography';
import { MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED } from 'src/constants';
import { useAccount } from 'src/queries/account';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';

export interface SMTPRestrictionTextProps {
  children: (props: { text: React.ReactNode }) => React.ReactNode;
  supportLink?: {
    id: number;
    label: string;
  };
}

export const SMTPRestrictionText = (props: SMTPRestrictionTextProps) => {
  const { supportLink } = props;
  const { data: account } = useAccount({});

  // If there account was created before restrictions were put into place,
  // there's no need to display anything.
  const text = !accountCreatedAfterRestrictions(
    account?.active_since
  ) ? null : (
    <Typography variant="body1">
      SMTP ports may be restricted on this Linode. Need to send email? Review
      our{' '}
      <Link
        onClick={() => sendLinodeCreateDocsEvent('SMTP Notice Link')}
        to="https://www.linode.com/docs/email/best-practices/running-a-mail-server/"
      >
        mail server guide
      </Link>
      , then{' '}
      {supportLink ? (
        <SupportLink
          entity={{ id: supportLink.id, type: 'linode_id' }}
          text="open a support ticket"
          ticketType="smtp"
          title={`SMTP Restriction Removal on ${supportLink.label}`}
        />
      ) : (
        'open a support ticket'
      )}
      .
    </Typography>
  );

  // eslint-disable-next-line
  return <>{props.children({ text })}</>;
};

export const accountCreatedAfterRestrictions = (_accountCreated?: string) => {
  // Default to `true` for bad input.
  if (!_accountCreated) {
    return true;
  }

  const restrictionsImplemented = new Date(
    MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED
  ).getTime();
  const accountCreated = new Date(_accountCreated).getTime();

  if (isNaN(accountCreated)) {
    return true;
  }

  return accountCreated >= restrictionsImplemented;
};
