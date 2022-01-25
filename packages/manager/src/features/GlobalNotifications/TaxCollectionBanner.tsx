import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { useAccount } from 'src/queries/account';

const nexusStates = ['AZ', 'HI', 'PA', 'TX', 'WA'];
const taxableCountries = ['CA', 'JP', 'NO'];

const TaxCollectionBanner: React.FC<{}> = () => {
  const history = useHistory();

  const { data: account } = useAccount();
  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'start-tax-collection'
  );

  if (!account || hasDismissedBanner) {
    return null;
  }

  const isNexusState =
    account.country === 'US' && nexusStates.includes(account.state);
  const isTaxableCountry = taxableCountries.includes(account.country);

  if (!isNexusState && !isTaxableCountry) {
    return null;
  }

  return (
    <Notice warning important dismissible onClose={handleDismiss}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography>
          Starting {isNexusState ? 'TBD' : isTaxableCountry ? 'TBD' : null}, tax
          may be applied to your Linode services. For more information, please
          see the{' '}
          <Link to="https://www.linode.com/docs/platform/billing-and-support/tax-information/">
            Tax Information Guide
          </Link>
          .
        </Typography>
        {isTaxableCountry ? (
          <Button
            buttonType="primary"
            onClick={() => history.push('/account/billing/edit')}
          >
            Update Tax ID
          </Button>
        ) : null}
      </Box>
    </Notice>
  );
};

export default TaxCollectionBanner;
