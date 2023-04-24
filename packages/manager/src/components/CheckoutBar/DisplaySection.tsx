import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { StyledDiv2 } from './styles';

export interface Props {
  title: string;
  details?: string | number;
}

const DisplaySection = React.memo((props: Props) => {
  const { title, details } = props;

  const theme = useTheme();

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
          sx={{
            color: theme.color.headline,
            fontSize: '.8rem',
            lineHeight: '1.5em',
          }}
        >
          {details}
        </Typography>
      ) : null}
    </StyledDiv2>
  );
});

export { DisplaySection };
