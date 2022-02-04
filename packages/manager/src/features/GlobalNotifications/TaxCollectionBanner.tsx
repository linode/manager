import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';

const TaxCollectionBanner: React.FC<{}> = () => {
  const flags = useFlags();
  const history = useHistory();

  const { data: account } = useAccount();
  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'tax-collection-banner'
  );

  if (!account || hasDismissedBanner) {
    return null;
  }

  const { date, action } = flags.taxCollectionBanner!;

  return (
    <Notice warning important dismissible onClose={handleDismiss}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography>
          Starting {date}, tax may be applied to your Linode services. For more
          information, please see the{' '}
          <Link to="https://www.linode.com/docs/platform/billing-and-support/tax-information/">
            Tax Information Guide
          </Link>
          .
        </Typography>
        {action ? (
          <Button
            buttonType="primary"
            onClick={() => history.push('/account/billing/edit')}
            style={{ whiteSpace: 'nowrap' }}
          >
            Update Tax ID
          </Button>
        ) : null}
      </Box>
    </Notice>
  );
};

export default TaxCollectionBanner;
