import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles } from '@mui/styles';

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
  prefixStyle?: React.CSSProperties;
  prefixComponent: JSX.Element | null;
}

type CombinedProps = Props;

const FinalCrumbPrefix: React.FC<CombinedProps> = (props) => {
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

export default compose<CombinedProps, Props>(React.memo)(FinalCrumbPrefix);
