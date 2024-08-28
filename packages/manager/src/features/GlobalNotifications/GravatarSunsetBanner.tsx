import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Typography } from 'src/components/Typography';

export const GravatarSunsetBanner = () => {
  const GRAVATAR_DEPRECATION_DATE = 'September 16th, 2024';

  return (
    <DismissibleBanner preferenceKey="gravatar-sunset" variant="info">
      <Typography variant="body1">
        {`Support for using Gravatar as your profile photo will be deprecated on ${GRAVATAR_DEPRECATION_DATE}. Your profile photo will automatically be changed to your username initial.`}
      </Typography>
    </DismissibleBanner>
  );
};
