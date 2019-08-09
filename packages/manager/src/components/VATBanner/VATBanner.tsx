import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Notice from 'src/components/Notice';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import useFlags from 'src/hooks/useFlags';

const VATBanner: React.FC<{}> = props => {
  const flags = useFlags();

  {
    /* 
    launch darkly is responsible for determining who and who doesn't see this banner
    based on country information we send to the service in IdentifyUser.tsx
  */
  }
  if (flags.vatBanner && !!Object.keys(flags.vatBanner).length) {
    const { text, link, preference_key } = flags.vatBanner!;

    return (
      <PreferenceToggle<boolean>
        preferenceKey={preference_key}
        preferenceOptions={[true, false]}
      >
        {({
          preference: isDismissed,
          togglePreference: dismissBanner
        }: ToggleProps<boolean>) => {
          return isDismissed ? (
            <React.Fragment />
          ) : (
            <Notice
              warning
              text={
                <React.Fragment>
                  {text} by clicking <Link to={link}>here.</Link>
                </React.Fragment>
              }
              dismissible={true}
              onClose={dismissBanner}
            />
          );
        }}
      </PreferenceToggle>
    );
  } else {
    return null;
  }
};

export default compose<{}, {}>(React.memo)(VATBanner);
