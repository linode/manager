import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { useDismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { DateTime } from 'luxon';

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
  const { hasDismissedBanner, handleDismiss } = useDismissibleBanner(
    'tax-collection-banner'
  );

  const countryDateString = flags.taxCollectionBanner?.date ?? '';
  const bannerHasAction = flags.taxCollectionBanner?.action ?? false;
  const bannerRegions =
    flags.taxCollectionBanner?.regions?.map((region) => {
      if (typeof region === 'string') {
        return region;
      }
      return region.name;
    }) ?? [];

  if (!account || hasDismissedBanner || !countryDateString) {
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
    <Notice warning important dismissible onClose={handleDismiss}>
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
    </Notice>
  ) : null;
};

export default TaxCollectionBanner;
