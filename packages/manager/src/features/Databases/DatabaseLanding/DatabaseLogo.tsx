import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import Logo from 'src/assets/icons/db-logo.svg';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';

import type { Theme } from '@mui/material/styles';

interface Props {
  style?: React.CSSProperties;
}

const useStyles = makeStyles()((theme: Theme) => ({
  betaChip: {
    backgroundColor: '#727272',
    color: theme.color.white,
  },
  logo: {
    color: '#32363C',
    display: 'flex',
    marginTop: '8px',
  },
}));

export const DatabaseLogo = ({ style }: Props) => {
  const { classes } = useStyles();
  return (
    <Box
      display="flex"
      justifyContent="center"
      sx={style ? style : { margin: '20px' }}
    >
      <Typography sx={{ display: 'inline-block', textAlign: 'center' }}>
        <BetaChip className={classes.betaChip} component="span" />
        <span className={classes.logo}>
          Powered by <Logo />
        </span>
      </Typography>
    </Box>
  );
};

export default DatabaseLogo;
