import * as React from 'react';
import Link from 'src/components/Link';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Box from 'src/components/core/Box';
import Logo from 'src/assets/logo/akamai-logo.svg';
import ErrorState from 'src/components/ErrorState';
import BuildIcon from '@mui/icons-material/Build';

const useStyles = makeStyles((theme: Theme) => ({
  bgStyling: {
    backgroundColor: theme.bg.main,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  maintenanceWrapper: {
    padding: theme.spacing(4),
    [theme.breakpoints.up('xl')]: {
      width: '50%',
      margin: '0 auto',
    },
  },
  logo: {
    '& > g': {
      fill: theme.color.black,
    },
  },
  errorHeading: {
    marginBottom: theme.spacing(2),
  },
  subheading: {
    margin: '0 auto',
    maxWidth: '75%',
  },
}));

export const MaintenanceScreen: React.FC<{}> = () => {
  const classes = useStyles();

  const maintenanceCopy = (
    <Typography variant="h2" className={classes.errorHeading}>
      We are undergoing scheduled maintenance.
    </Typography>
  );

  const statusPageCopy = (
    <Typography className={classes.subheading}>
      Visit{' '}
      <Link to="https://status.linode.com/">https://status.linode.com</Link> for
      updates on the Cloud Manager and API.
    </Typography>
  );

  return (
    <div className={classes.bgStyling}>
      <div className={classes.maintenanceWrapper}>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Logo width={215} className={classes.logo} />
        </Box>

        <ErrorState
          CustomIcon={BuildIcon}
          CustomIconStyles={{
            color: 'black',
          }}
          errorText={
            <>
              {maintenanceCopy}
              {statusPageCopy}
            </>
          }
        />
      </div>
    </div>
  );
};
