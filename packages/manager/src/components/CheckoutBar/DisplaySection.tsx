import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { StyledCheckoutSection, SxTypography } from './styles';

export interface DisplaySectionProps {
  title: string;
  details?: string | number;
}

const DisplaySection = React.memo((props: DisplaySectionProps) => {
  const { details, title } = props;

  return (
    <StyledCheckoutSection>
      {title && (
        <Typography variant="h3" data-qa-subheading={title}>
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
