import { makeStyles } from '@mui/styles';
import * as React from 'react';

const useStyles = makeStyles({
  prefixComponentWrapper: {
    '& svg, & img': {
      marginLeft: 4,
      marginRight: 8,
      position: 'relative',
      top: -2,
    },
  },
});

interface Props {
  prefixComponent: JSX.Element | null;
  prefixStyle?: React.CSSProperties;
}

export const FinalCrumbPrefix = (props: Props) => {
  const classes = useStyles();

  const { prefixComponent, prefixStyle } = props;

  return (
    <div
      className={classes.prefixComponentWrapper}
      data-qa-prefixwrapper
      style={prefixStyle}
    >
      {prefixComponent}
    </div>
  );
};
