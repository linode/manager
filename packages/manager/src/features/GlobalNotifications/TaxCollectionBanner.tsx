import { DateTime } from 'luxon';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import Link from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginLeft: theme.spacing(2),
    minWidth: 140,
    whiteSpace: 'nowrap',
  },
}));

const TaxCollectionBanner: React.FC<{}> = () => {
  const classes = useStyles();
  const history = useHistory();
  const flags = useFlags();

  const { data: account } = useAccount();

  const countryDateString = flags.taxCollectionBanner?.date ?? '';
  const bannerHasAction = flags.taxCollectionBanner?.action ?? false;
  const bannerRegions =
    flags.taxCollectionBanner?.regions?.map((region) => {
      if (typeof region === 'string') {
        return region;
      }
      return region.name;
    }) ?? [];

  if (!account || !countryDateString) {
    return null;
  }

  const regionDateString = flags.taxCollectionBanner?.regions?.find(
    (region) => region.name === account.state
  )?.date;

  const bannerDateString = regionDateString ?? countryDateString;
  const bannerDate = DateTime.fromFormat(bannerDateString, 'LLLL dd yyyy');
  const isBannerDateWithinFiveWeeksPrior =
    bannerDate.plus({ days: 35 }) <= DateTime.now();

  /**
   * If bannerRegions is empty, display the banner for everyone in the country
   * since everyone will be taxed the same.
   */
  const isEntireCountryTaxable = bannerRegions.length === 0;

  /**
   * If bannerRegions is not empty, only display the banner for customers
   * whose region is included in the list.
   */
  const isUserInTaxableRegion =
    bannerRegions.length > 0 && bannerRegions.includes(account.state);

  return (isEntireCountryTaxable || isUserInTaxableRegion) &&
    !isBannerDateWithinFiveWeeksPrior ? (
    <DismissibleBanner warning important preferenceKey="tax-collection-banner">
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography>
          Starting {bannerDateString}, tax may be applied to your Linode
          services. For more information, please see the{' '}
          <Link to="https://www.linode.com/docs/platform/billing-and-support/tax-information/">
            Tax Information Guide
          </Link>
          .
        </Typography>
        {bannerHasAction ? (
          <Button
            buttonType="primary"
            className={classes.button}
            onClick={() => history.push('/account/billing/edit')}
          >
            Update Tax ID
          </Button>
        ) : null}
      </Box>
    </DismissibleBanner>
  ) : null;
};

export default TaxCollectionBanner;
