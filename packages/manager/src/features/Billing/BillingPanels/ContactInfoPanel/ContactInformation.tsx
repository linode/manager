import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { allCountries } from 'country-region-data';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { EDIT_BILLING_CONTACT } from 'src/features/Billing/constants';
import { StyledAutorenewIcon } from 'src/features/TopMenu/NotificationMenu/NotificationMenu';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useNotificationsQuery } from 'src/queries/account/notifications';

import {
  BillingActionButton,
  BillingBox,
  BillingPaper,
} from '../../BillingDetail';
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

const StyledTypography = styled(Typography)(({ theme }) => ({
  '& .dif': {
    '& .MuiChip-root': {
      position: 'absolute',
      right: -10,
      top: '-4px',
    },
    position: 'relative',
    width: 'auto',
  },
  marginBottom: theme.spacing(1),
}));

const ContactInformation = (props: Props) => {
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

  const history = useHistory<{
    contactDrawerOpen?: boolean;
    focusEmail?: boolean;
  }>();

  const [
    editContactDrawerOpen,
    setEditContactDrawerOpen,
  ] = React.useState<boolean>(false);

  const { data: notifications } = useNotificationsQuery();

  const [focusEmail, setFocusEmail] = React.useState(false);

  const isChildUser = Boolean(profile?.user_type === 'child');

  const taxIdIsVerifyingNotification = notifications?.find((notification) => {
    return notification.type === 'tax_id_verifying';
  });

  const isReadOnly =
    useRestrictedGlobalGrantCheck({
      globalGrantType: 'account_access',
      permittedGrantLevel: 'read_write',
    }) || isChildUser;

  const handleEditDrawerOpen = React.useCallback(
    () => setEditContactDrawerOpen(true),
    [setEditContactDrawerOpen]
  );

  // On-the-fly route matching so this component can open the drawer itself.
  const editBillingContactRouteMatch = Boolean(
    useRouteMatch('/account/billing/edit')
  );

  React.useEffect(() => {
    if (editBillingContactRouteMatch) {
      handleEditDrawerOpen();
    }
  }, [editBillingContactRouteMatch, handleEditDrawerOpen]);

  // Listen for changes to history state and open the drawer if necessary.
  // This is currently in use by the EmailBounceNotification, which navigates
  // the user to the Account page and opens the drawer to prompt them to change
  // their billing email address.
  React.useEffect(() => {
    if (!editContactDrawerOpen && history.location.state?.contactDrawerOpen) {
      setEditContactDrawerOpen(true);
      if (history.location.state?.focusEmail) {
        setFocusEmail(true);
      }
    }
  }, [editContactDrawerOpen, history.location.state]);

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
    <Grid md={6} xs={12}>
      <BillingPaper data-qa-contact-summary variant="outlined">
        <BillingBox>
          <Typography variant="h3">Billing Contact</Typography>
          <BillingActionButton
            onClick={() => {
              history.push('/account/billing/edit');
              handleEditDrawerOpen();
            }}
            tooltipText={getRestrictedResourceText({
              includeContactInfo: false,
              isChildUser,
              resourceType: 'Account',
            })}
            data-testid="edit-contact-info"
            disableFocusRipple
            disableRipple
            disableTouchRipple
            disabled={isReadOnly}
          >
            {EDIT_BILLING_CONTACT}
          </BillingActionButton>
        </BillingBox>

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
                <MaskableText
                  text={`${firstName} ${lastName}`}
                  length="plaintext"
                >
                  <StyledTypography
                    data-qa-contact-name
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {firstName} {lastName}
                  </StyledTypography>
                </MaskableText>
              )}
              {company && (
                <MaskableText text={company} length="plaintext">
                  <>
                    {' '}
                    <StyledTypography
                      data-qa-company
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {company}
                    </StyledTypography>
                  </>
                </MaskableText>
              )}
              {(address1 || address2 || city || state || zip || country) && (
                <MaskableText
                  text={`${address1} ${address2}`}
                  length="plaintext"
                >
                  <>
                    <StyledTypography data-qa-contact-address>
                      {address1}
                    </StyledTypography>
                    <StyledTypography>{address2}</StyledTypography>
                  </>
                </MaskableText>
              )}
              <MaskableText text={`${city} ${state} ${zip}`} length="plaintext">
                <StyledTypography>
                  {city}
                  {city && state && ','} {state} {zip}
                </StyledTypography>
              </MaskableText>
              <MaskableText text={countryName}>
                <StyledTypography>{countryName}</StyledTypography>
              </MaskableText>
            </Grid>
          )}
          <Grid sx={sxGrid}>
            <MaskableText text={email} length="plaintext">
              <StyledTypography
                data-qa-contact-email
                sx={{ wordBreak: 'break-all' }}
              >
                {email}
              </StyledTypography>
            </MaskableText>
            {phone && (
              <MaskableText text={phone} length="plaintext">
                <StyledTypography data-qa-contact-phone>
                  {phone}
                </StyledTypography>
              </MaskableText>
            )}
            {taxId && (
              <MaskableText text={taxId} length="plaintext">
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
                      status="other"
                      text={taxIdIsVerifyingNotification.label}
                    />
                  )}
                </Box>
              </MaskableText>
            )}
          </Grid>
        </Grid>
      </BillingPaper>
      <BillingContactDrawer
        onClose={() => {
          history.replace('/account/billing', { contactDrawerOpen: false });
          setEditContactDrawerOpen(false);
          setFocusEmail(false);
        }}
        focusEmail={focusEmail}
        open={editContactDrawerOpen}
      />
    </Grid>
  );
};

export default React.memo(ContactInformation);
