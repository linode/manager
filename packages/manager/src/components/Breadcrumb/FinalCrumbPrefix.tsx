import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { compose } from 'recompose';

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
