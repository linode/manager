import * as React from 'react';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import SupportLink from 'src/components/SupportLink';
import { MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED } from 'src/constants';
import { useAccount } from 'src/queries/account';
import { sendLinodeCreateDocsEvent } from 'src/utilities/ga';
export interface Props {
  children: (props: { text: React.ReactNode }) => React.ReactNode;
  supportLink?: {
    label: string;
    id: number;
  };
}

const SMTPRestrictionText: React.FC<Props> = (props) => {
  const { supportLink } = props;
  const { data: account } = useAccount();

  // If there account was created before restrictions were put into place,
  // there's no need to display anything.
  const text = !accountCreatedAfterRestrictions(
    account?.active_since
  ) ? null : (
    <Typography variant="body1">
      SMTP ports may be restricted on this Linode. Need to send email? Review
      our{' '}
      <ExternalLink
        onClick={() => sendLinodeCreateDocsEvent('SMTP Notice Link')}
        link="https://www.linode.com/docs/email/best-practices/running-a-mail-server/"
        text="mail server guide"
        hideIcon
      />
      , then{' '}
      {supportLink ? (
        <SupportLink
          text="open a support ticket"
          title={`SMTP Restriction Removal on ${supportLink.label}`}
          entity={{ type: 'linode_id', id: supportLink.id }}
          ticketType="smtp"
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

export default SMTPRestrictionText;

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
