import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Notice from 'src/components/Notice';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import useFlags from 'src/hooks/useFlags';

interface Props {
  location: RouteComponentProps<{}>['location'];
}

const VATBanner: React.FC<Props> = props => {
  const flags = useFlags();

  const [shouldShowBanner, setBannerVisibility] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    const isBillingPage = props.location.pathname.match(/account[/]billing/);

    /** only change banner visibility if it isn't already set */
    if (shouldShowBanner && isBillingPage) {
      setBannerVisibility(false);
    }

    if (!shouldShowBanner && !isBillingPage) {
      setBannerVisibility(true);
    }
  });

  {
    /* 
    launch darkly is responsible for determining who and who doesn't see this banner
    based on country information we send to the service in IdentifyUser.tsx

    As of Aug 14, 2019, this is the payload this component expects from LD

    {} || {
      tax_name: string;
      date: string;
    }
  */
  }
  if (
    shouldShowBanner &&
    flags.vatBanner &&
    !!Object.keys(flags.vatBanner).length
  ) {
    const { tax_name, date } = flags.vatBanner!;

    const taxNameToUpperCase = tax_name.toUpperCase();

    return (
      <PreferenceToggle<boolean>
        preferenceKey={`${tax_name.toLowerCase()}_banner_dismissed`}
        preferenceOptions={[true, false]}
      >
        {({
          preference: isDismissed,
          togglePreference: dismissBanner
        }: ToggleProps<boolean>) => {
          return isDismissed ? (
            <React.Fragment />
          ) : (
            <Notice warning dismissible={true} onClose={dismissBanner}>
              Starting {date}, {taxNameToUpperCase} may be applied to your
              Linode services. For more information, please see the{' '}
              <a
                href="https://www.linode.com/docs/platform/billing-and-support/tax-information/"
                target="_blank"
              >
                Tax Information Guide.
              </a>{' '}
              To ensure the correct {taxNameToUpperCase} is applied, please
              verify your <Link to="/account/billing">contact information</Link>{' '}
              is up to date.
            </Notice>
          );
        }}
      </PreferenceToggle>
    );
  } else {
    return null;
  }
};

export default compose<Props, Props>(React.memo)(VATBanner);
