import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { useAccount } from 'src/queries/account';

// @TODO: add Canada to the list of countries once a tax collection date is determined
const taxableCountries = ['JP', 'NO'];
// const nexusStates = ['AZ', 'HI', 'PA', 'TX', 'WA'];

const TaxCollectionBanner: React.FC<{}> = () => {
  const history = useHistory();

  const { data: account } = useAccount();
  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'start-tax-collection'
  );

  if (!account || hasDismissedBanner) {
    return null;
  }

  const isTaxableCountry = taxableCountries.includes(account.country);
  // const isNexusState =
  //   account.country === 'US' && nexusStates.includes(account.state);

  // if (!isTaxableCountry && !isNexusState) {
  if (!isTaxableCountry) {
    return null;
  }

  const getTaxCollectionDate = (country: string) => {
    if (country === 'JP') {
      return '2022-04-01';
    }

    if (country === 'NO') {
      return '2022-05-01';
    }

    // if (flags.taxCollectionPart2) {
    //   if (country === 'CA') {
    //     return '[CANADA DATE]';
    //   }

    //   if (isNexusState) {
    //     switch (state) {
    //       case 'AZ':
    //         return '[ARIZONA DATE]';
    //       case 'HI':
    //         return '[HAWAII DATE]';
    //       case 'PA':
    //         return '[PENNSYLVANIA DATE]';
    //       case 'TX':
    //         return '[TEXAS DATE]';
    //       case 'WA':
    //         return '[WASHINGTON DATE]';
    //     }
    //   }
    // }

    return null;
  };

  return (
    <Notice warning important dismissible onClose={handleDismiss}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography>
          Starting {getTaxCollectionDate(account.country)}, tax may be applied
          to your Linode services. For more information, please see the{' '}
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
