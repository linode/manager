import { Box, Checkbox, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';

interface Props {
  centerCheckbox?: boolean;
  checked: boolean;
  className?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

export const EUAgreementCheckbox = (props: Props) => {
  const { centerCheckbox, checked, className, onChange } = props;
  const theme = useTheme();

  const checkboxStyle = centerCheckbox
    ? {}
    : {
        marginTop: '-5px',
      };

  return (
    <Box
      sx={{
        [theme.breakpoints.down('md')]: {
          marginLeft: theme.spacing(1),
          marginRight: theme.spacing(1),
        },
      }}
      alignItems={centerCheckbox ? 'center' : 'flex-start'}
      className={className}
      data-testid="eu-agreement-checkbox"
      display="flex"
      flexDirection="row"
    >
      <Checkbox
        checked={checked}
        id="gdpr-checkbox"
        onChange={onChange}
        sx={checkboxStyle}
      />
      <Typography
        component="label"
        htmlFor="gdpr-checkbox"
        style={{ marginLeft: 16 }}
      >
        I have read and agree to the{' '}
        <Link to="https://www.linode.com/legal-privacy/">
          Linode Privacy Policy
        </Link>{' '}
        and{' '}
        <Link to="https://www.linode.com/eu-model/">
          EU Standard Contractual Clauses
        </Link>
        , which govern the cross-border transfer of data relating to the
        European Economic Area.
      </Typography>
    </Box>
  );
};
