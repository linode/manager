import { Button, Typography } from '@linode/ui';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from '@linode/queries';

export const TaxCollectionBanner = () => {
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

  const actionButton = bannerHasAction ? (
    <Button
      sx={(theme) => ({
        marginLeft: theme.spacing(2),
        minWidth: '140px',
        whiteSpace: 'nowrap',
      })}
      buttonType="primary"
      onClick={() => history.push('/account/billing/edit')}
    >
      Update Tax ID
    </Button>
  ) : undefined;

  return (isEntireCountryTaxable || isUserInTaxableRegion) &&
    !isBannerDateWithinFiveWeeksPrior ? (
    <DismissibleBanner
      actionButton={actionButton}
      important
      preferenceKey="tax-collection-banner"
      variant="warning"
    >
      <Typography>
        Starting {bannerDateString}, tax may be applied to your Linode services.
        For more information, please see the{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/tax-information">
          Tax Information Guide
        </Link>
        .
      </Typography>
    </DismissibleBanner>
  ) : null;
};
