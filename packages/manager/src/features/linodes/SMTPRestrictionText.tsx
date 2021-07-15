import * as React from 'react';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import { useAccount } from 'src/queries/account';

// "In an effort to fight spam, Linode restricts outbound connections on ports 25, 465, and 587 on all Linodes for new accounts created after November 5th, 2019."
// https://www.linode.com/docs/email/best-practices/running-a-mail-server/
const MAGIC_DATE_THAT_EMAIL_RESTRICTIONS_WERE_IMPLEMENTED =
  '2019-11-06T00:00:00.000Z';

interface Props {
  children: (props: { text: React.ReactNode }) => React.ReactNode;
}

const SMTPRestrictionText: React.FC<Props> = (props) => {
  const { data: account } = useAccount();

  // If there account was created before restrictions were put into place,
  // there's no need to display anything.
  const text = !accountCreatedAfterRestrictions(
    account?.active_since
  ) ? null : (
    <Typography variant="body1">
      Need to send mail from your Linode? New Linode accounts have ports{' '}
      <strong>25, 465, and 587</strong> blocked by default. To have these
      restrictions removed, please review{' '}
      <ExternalLink
        link="https://www.linode.com/docs/email/best-practices/running-a-mail-server/"
        text="this guide"
        hideIcon
      />
      , then <strong>open a Support Ticket after creating your Linode.</strong>
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
