import { SxProps } from '@mui/material';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import ToolTip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';

interface Props {
  displayText: string;
  tooltipText: JSX.Element | string;
  sxTypography?: SxProps;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    borderRadius: 4,
    cursor: 'pointer',
    textDecoration: `underline dotted ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  },
  flex: {
    display: 'flex',
    width: 'auto !important',
  },
  popper: {
    '& .MuiTooltip-tooltip': {
      minWidth: 375,
    },
  },
}));

export const TextTooltip = (props: Props) => {
  const classes = useStyles();
  const { displayText, tooltipText, sxTypography } = props;

  return (
    <ToolTip
      title={tooltipText}
      placement="bottom"
      enterTouchDelay={0}
      className={classes.root}
      classes={{ popper: classes.popper }}
    >
      <Typography component="span" sx={sxTypography}>
        {displayText}
      </Typography>
    </ToolTip>
  );
};

export default TextTooltip;
