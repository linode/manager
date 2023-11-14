import * as React from 'react';

import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

interface Props {
  centerCheckbox?: boolean;
  checked: boolean;
  className?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

const EUAgreementCheckbox = (props: Props) => {
  const { centerCheckbox, checked, className, onChange } = props;

  const checkboxStyle = centerCheckbox
    ? { marginLeft: -8 }
    : { marginLeft: -8, marginTop: -5 };

  return (
    <Box
      alignItems={centerCheckbox ? 'center' : 'flex-start'}
      className={className}
      display="flex"
      flexDirection="row"
      data-testid="eu-agreement-checkbox"
    >
      <Checkbox checked={checked} onChange={onChange} style={checkboxStyle} />
      <Typography style={{ marginLeft: 4 }}>
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

export default EUAgreementCheckbox;
