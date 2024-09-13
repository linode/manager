import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Typography } from 'src/components/Typography';
import { useGravatar } from 'src/hooks/useGravatar';

interface Props {
  email: string;
}

export const GravatarSunsetBanner = (props: Props) => {
  const { email } = props;
  const GRAVATAR_DEPRECATION_DATE = 'September 30th, 2024';

  const { hasGravatar, isLoadingGravatar } = useGravatar(email);

  if (isLoadingGravatar || !hasGravatar) {
    return;
  }
  return (
    <DismissibleBanner preferenceKey="gravatar-sunset" variant="info">
      <Typography variant="body1">
        {`Support for using Gravatar as your profile photo will be deprecated on ${GRAVATAR_DEPRECATION_DATE}. Your profile photo will automatically be changed to your username initial.`}
      </Typography>
    </DismissibleBanner>
  );
};
