import countryData from 'country-region-data';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import BillingContactDrawer from './EditBillingContactDrawer';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import {
  BillingPaper,
  BillingBox,
  BillingActionButton,
} from '../../BillingDetail';

interface Props {
  company: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email: string;
  phone: string;
  taxId: string;
}

const StyledTypography = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  '& .dif': {
    position: 'relative',
    width: 'auto',
    '& .chip': {
      position: 'absolute',
      top: '-4px',
      right: -10,
    },
  },
}));

const ContactInformation = (props: Props) => {
  const {
    company,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zip,
    country,
    email,
    phone,
    taxId,
  } = props;

  const history = useHistory<{
    contactDrawerOpen?: boolean;
    focusEmail?: boolean;
  }>();

  const [
    editContactDrawerOpen,
    setEditContactDrawerOpen,
  ] = React.useState<boolean>(false);

  const [focusEmail, setFocusEmail] = React.useState(false);

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

  // Finding the country from the countryData JSON
  const countryName = countryData?.find(
    (_country) => _country.countryShortCode === country
  )?.countryName;

  const sxBox = {
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
    <Grid xs={12} md={6}>
      <BillingPaper variant="outlined" data-qa-contact-summary>
        <BillingBox>
          <Typography variant="h3">Billing Contact</Typography>
          <BillingActionButton
            onClick={() => {
              history.push('/account/billing/edit');
              handleEditDrawerOpen();
            }}
          >
            Edit
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
            <Box sx={sxBox}>
              {(firstName || lastName) && (
                <StyledTypography
                  sx={{ wordBreak: 'break-all' }}
                  data-qa-contact-name
                >
                  {firstName} {lastName}
                </StyledTypography>
              )}
              {company && (
                <StyledTypography
                  sx={{ wordBreak: 'break-all' }}
                  data-qa-company
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
            </Box>
          )}

          <Box sx={sxBox}>
            <StyledTypography
              sx={{ wordBreak: 'break-all' }}
              data-qa-contact-email
            >
              {email}
            </StyledTypography>
            {phone && (
              <StyledTypography data-qa-contact-phone>{phone}</StyledTypography>
            )}
            {taxId && (
              <StyledTypography sx={{ marginTop: 'auto' }}>
                <strong>Tax ID</strong> {taxId}
              </StyledTypography>
            )}
          </Box>
        </Grid>
      </BillingPaper>
      <BillingContactDrawer
        open={editContactDrawerOpen}
        onClose={() => {
          history.replace('/account/billing', { contactDrawerOpen: false });
          setEditContactDrawerOpen(false);
          setFocusEmail(false);
        }}
        focusEmail={focusEmail}
      />
    </Grid>
  );
};

export default React.memo(ContactInformation);
