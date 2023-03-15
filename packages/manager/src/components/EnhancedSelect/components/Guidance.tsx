import HelpOutline from '@mui/icons-material/HelpOutline';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  guidance: {
    backgroundColor: theme.bg.offWhite,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
  text: {
    fontSize: '.8rem',
  },
  helpIcon: {
    width: 16,
    height: 16,
    position: 'relative',
    top: 3,
    marginRight: theme.spacing(1),
  },
}));

interface GuidanceProps {
  text: string;
}
type CombinedProps = GuidanceProps;

const Guidance: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { text } = props;

  return (
    <div className={classes.guidance}>
      <Typography className={classes.text}>
        <HelpOutline className={classes.helpIcon} />
        {text}
      </Typography>
    </div>
  );
};

export default Guidance;
