import { useNotificationsQuery, usePreferences } from '@linode/queries';
import { Box, TooltipIcon, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { allCountries } from 'country-region-data';
import * as React from 'react';
import { useState } from 'react';

import { MaskableTextAreaCopy } from 'src/components/MaskableText/MaskableTextArea';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { EDIT_BILLING_CONTACT } from 'src/features/Billing/constants';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { StyledAutorenewIcon } from 'src/features/TopMenu/NotificationMenu/NotificationMenu';

import {
  BillingActionButton,
  BillingBox,
  BillingPaper,
} from '../../BillingDetail';
import {
  StyledTypography,
  StyledVisibilityHideIcon,
  StyledVisibilityShowIcon,
} from './ContactInformation.styles';
import BillingContactDrawer from './EditBillingContactDrawer';

import type { Profile } from '@linode/api-v4';

interface Props {
  address1: string;
  address2: string;
  city: string;
  company: string;
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profile: Profile | undefined;
  state: string;
  taxId: string;
  zip: string;
}

export const ContactInformation = React.memo((props: Props) => {
  const {
    address1,
    address2,
    city,
    company,
    country,
    email,
    firstName,
    lastName,
    phone,
    profile,
    state,
    taxId,
    zip,
  } = props;

  const navigate = useNavigate();
  const { contactDrawerOpen, focusEmail } = useSearch({
    strict: false,
  });

  const { data: notifications } = useNotificationsQuery();

  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );

  const isChildUser = Boolean(profile?.user_type === 'child');

  const taxIdIsVerifyingNotification = notifications?.find((notification) => {
    return notification.type === 'tax_id_verifying';
  });

  const { data: permissions } = usePermissions('account', ['update_account']);

  const isReadOnly = !permissions.update_account || isChildUser;

  const handleEditDrawerOpen = () => {
    navigate({
      to: '/account/billing',
      search: (prev) => ({
        ...prev,
        action: 'edit',
        contactDrawerOpen: true,
        focusEmail: false,
      }),
    });
  };

  const [isContactInfoMasked, setIsContactInfoMasked] = useState(
    maskSensitiveDataPreference
  );

  /**
   * Finding the country from the countryData JSON
   * `country-region-data` mapping:
   *
   * COUNTRY
   * - country[0] is the readable name of the country (e.g. "United States")
   * - country[1] is the ISO 3166-1 alpha-2 code of the country (e.g. "US")
   * - country[2] is an array of regions for the country
   *
   * REGION
   * - region[0] is the readable name of the region (e.g. "Alabama")
   * - region[1] is the ISO 3166-2 code of the region (e.g. "AL")
   */
  const countryName = allCountries?.find((_country) => {
    const countryCode = _country[1];
    return countryCode === country;
  })?.[0];

  const sxGrid = {
    flex: 1,
    maxWidth: '100%',
    position: 'relative',
    ...(Boolean(taxId) &&
      taxId !== '' && {
        display: 'flex',
        flexDirection: 'column',
      }),
  };

  return (
    <Grid
      size={{
        md: 6,
        xs: 12,
      }}
    >
      <BillingPaper data-qa-contact-summary variant="outlined">
        <BillingBox>
          <Typography variant="h3">Billing Contact</Typography>
          <Box display="flex" marginLeft="auto">
            {!isContactInfoMasked && (
              <BillingActionButton
                data-testid="edit-contact-info"
                disabled={isReadOnly}
                disableFocusRipple
                disableRipple
                disableTouchRipple
                onClick={handleEditDrawerOpen}
                tooltipText={getRestrictedResourceText({
                  includeContactInfo: false,
                  isChildUser,
                  resourceType: 'Account',
                })}
              >
                {EDIT_BILLING_CONTACT}
              </BillingActionButton>
            )}
            {maskSensitiveDataPreference && (
              <BillingActionButton
                disabled={isReadOnly}
                disableFocusRipple
                disableRipple
                disableTouchRipple
                onClick={() => setIsContactInfoMasked(!isContactInfoMasked)}
                sx={{ marginLeft: !isContactInfoMasked ? 2 : 0 }}
              >
                {isContactInfoMasked ? (
                  <StyledVisibilityShowIcon />
                ) : (
                  <StyledVisibilityHideIcon />
                )}
                {isContactInfoMasked ? 'Show' : 'Hide'}
              </BillingActionButton>
            )}
          </Box>
        </BillingBox>
        {maskSensitiveDataPreference && isContactInfoMasked ? (
          <MaskableTextAreaCopy />
        ) : (
          <Grid container spacing={2}>
            {(firstName ||
              lastName ||
              company ||
              address1 ||
              address2 ||
              city ||
              state ||
              zip ||
              country) && (
              <Grid sx={sxGrid}>
                {(firstName || lastName) && (
                  <StyledTypography
                    data-qa-contact-name
                    sx={{ wordBreak: 'keep-all' }}
                  >
                    {firstName} {lastName}
                  </StyledTypography>
                )}
                {company && (
                  <StyledTypography
                    data-qa-company
                    sx={{ wordBreak: 'keep-all' }}
                  >
                    {company}
                  </StyledTypography>
                )}
                {(address1 || address2 || city || state || zip || country) && (
                  <>
                    <StyledTypography data-qa-contact-address>
                      {address1}
                    </StyledTypography>
                    <StyledTypography>{address2}</StyledTypography>
                  </>
                )}
                <StyledTypography>
                  {city}
                  {city && state && ','} {state} {zip}
                </StyledTypography>
                <StyledTypography>{countryName}</StyledTypography>
              </Grid>
            )}
            <Grid sx={sxGrid}>
              <StyledTypography
                data-qa-contact-email
                sx={{ wordBreak: 'break-all' }}
              >
                {email}
              </StyledTypography>
              {phone && (
                <StyledTypography data-qa-contact-phone>
                  {phone}
                </StyledTypography>
              )}
              {taxId && (
                <Box alignItems="center" display="flex">
                  <StyledTypography
                    sx={{
                      margin: 0,
                    }}
                  >
                    <strong>Tax ID</strong> {taxId}
                  </StyledTypography>
                  {taxIdIsVerifyingNotification && (
                    <TooltipIcon
                      icon={<StyledAutorenewIcon />}
                      text={taxIdIsVerifyingNotification.label}
                    />
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </BillingPaper>
      <BillingContactDrawer
        // This is currently in use by the EmailBounceNotification, which navigates
        // the user to the Account page and opens the drawer to prompt them to change
        // their billing email address.
        focusEmail={Boolean(focusEmail)}
        onClose={() => {
          navigate({
            to: '/account/billing',
            search: undefined,
          });
        }}
        open={Boolean(contactDrawerOpen)}
      />
    </Grid>
  );
});
