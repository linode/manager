import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { StyledDiv2, SxTypography } from './styles';

export interface Props {
  title: string;
  details?: string | number;
}

const DisplaySection = React.memo((props: Props) => {
  const { title, details } = props;

  return (
    <StyledDiv2>
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
    </StyledDiv2>
  );
});

export { DisplaySection };
