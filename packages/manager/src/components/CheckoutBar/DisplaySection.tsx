import { Typography } from '@linode/ui';
import * as React from 'react';

import { StyledCheckoutSection, SxTypography } from './styles';

export interface DisplaySectionProps {
  details?: number | string;
  title: string;
}

const DisplaySection = React.memo((props: DisplaySectionProps) => {
  const { details, title } = props;

  return (
    <StyledCheckoutSection>
      {title && (
        <Typography data-qa-subheading={title} variant="h3">
          {title}
        </Typography>
      )}
      {details ? (
        <Typography
          component="span"
          data-qa-details={details}
          sx={SxTypography}
        >
          {details}
        </Typography>
      ) : null}
    </StyledCheckoutSection>
  );
});

export { DisplaySection };
