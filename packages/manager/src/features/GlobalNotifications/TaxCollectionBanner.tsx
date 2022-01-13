import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Notice from 'src/components/Notice';
import { useAccount } from 'src/queries/account';

const nexusStates = ['AZ', 'HI', 'PA', 'TX', 'WA'];
const nexusStatesCopy = 'Copy for nexus states.';

const taxableCountries = ['CA', 'JP'];
const taxableCountriesCopy = 'Copy for Canada and Japan.';

const TaxCollectionBanner: React.FC<{}> = () => {
  const history = useHistory();

  const { data: account } = useAccount();
  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'tax-collection'
  );

  if (!account) {
    return null;
  }

  const isNexusState =
    account.country === 'US' && nexusStates.includes(account.state);
  const isTaxableCountry = taxableCountries.includes(account.country);

  if (hasDismissedBanner || (!isNexusState && !isTaxableCountry)) {
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
          {isNexusState
            ? nexusStatesCopy
            : isTaxableCountry
            ? taxableCountriesCopy
            : null}
        </Typography>
        {isTaxableCountry ? (
          // Open billing contact info drawer
          <Button
            buttonType="primary"
            onClick={() => history.push('/account/billing/edit')}
          >
            Action
          </Button>
        ) : null}
      </Box>
    </Notice>
  );
};

export default TaxCollectionBanner;
