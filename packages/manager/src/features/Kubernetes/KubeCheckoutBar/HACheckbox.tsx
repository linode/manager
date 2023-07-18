import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { DisplayPrice } from 'src/components/DisplayPrice';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { HIGH_AVAILABILITY_PRICE } from 'src/constants';

export const HACopy = () => (
  <Typography>
    A high availability (HA) control plane is replicated on multiple master
    nodes to provide 99.99% uptime, and is recommended for production workloads.{' '}
    <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
      Learn more about the HA control plane
    </Link>
    .
  </Typography>
);

const useStyles = makeStyles((theme: Theme) => ({
  checkbox: {
    marginLeft: -8,
    marginTop: -8,
  },
  heading: {
    fontSize: '16px',
    fontWeight: 600,
    paddingBottom: theme.spacing(),
    paddingTop: theme.spacing(0.5),
  },
  price: {
    '& h3': {
      color: `${theme.palette.text.primary} !important`,
      fontFamily: theme.font.normal,
    },
    marginTop: theme.spacing(),
  },
}));

export interface Props {
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

const HACheckbox: React.FC<Props> = (props) => {
  const { checked, onChange } = props;
  const classes = useStyles();

  if (HIGH_AVAILABILITY_PRICE === undefined) {
    return null;
  }

  return (
    <Box>
      <Box alignItems="flex-start" display="flex" flexDirection="row">
        <Checkbox
          checked={checked}
          className={classes.checkbox}
          data-testid="ha-checkbox"
          onChange={onChange}
        />
        <Box>
          <Typography className={classes.heading}>
            Enable HA Control Plane
          </Typography>
          <HACopy />
        </Box>
      </Box>
      <Box className={classes.price}>
        <DisplayPrice
          fontSize="14px"
          interval="month"
          price={HIGH_AVAILABILITY_PRICE}
        />
      </Box>
    </Box>
  );
};

export default HACheckbox;
