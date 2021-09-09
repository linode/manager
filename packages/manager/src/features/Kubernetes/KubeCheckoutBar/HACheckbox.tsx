import * as React from 'react';
import CheckBox from 'src/components/CheckBox';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DisplayPrice from 'src/components/DisplayPrice';
import Link from 'src/components/Link';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(),
    fontSize: '16px',
    fontWeight: 600,
  },
  checkbox: {
    marginTop: -8,
    marginLeft: -8,
  },
  price: {
    marginTop: theme.spacing(),
  },
}));

interface Props {
  checked: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

const HACheckbox: React.FC<Props> = (props) => {
  const { checked, onChange } = props;
  const classes = useStyles();

  return (
    <Box>
      <Box display="flex" flexDirection="row" alignItems="flex-start">
        <CheckBox
          checked={checked}
          onChange={onChange}
          className={classes.checkbox}
        />
        <Box>
          <Typography className={classes.heading}>
            Enable HA Control Plane
          </Typography>
          <Typography>
            A high availability control plane sets up Kubernetes with important
            components replicated on multiple masters so there is no single
            point of failure.{' '}
            <Link to="https://www.linode.com/idk/">
              Read about the benefits of HA.
            </Link>
          </Typography>
        </Box>
      </Box>
      <Box className={classes.price}>
        <DisplayPrice price={100} fontSize="16px" interval="month" />
      </Box>
    </Box>
  );
};

export default HACheckbox;
