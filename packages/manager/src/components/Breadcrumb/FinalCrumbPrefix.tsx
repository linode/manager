import * as React from 'react';
import { compose } from 'recompose';
import { CSSProperties, makeStyles } from 'src/components/core/styles';

const useStyles = makeStyles({
  prefixComponentWrapper: {
    '& svg, & img': {
      position: 'relative',
      marginRight: 8,
      marginLeft: 4,
      top: -2
    }
  }
});

interface Props {
  prefixStyle?: CSSProperties;
  prefixComponent: JSX.Element | null;
}

type CombinedProps = Props;

const FinalCrumbPrefix: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { prefixComponent, prefixStyle } = props;

  return (
    <div
      className={classes.prefixComponentWrapper}
      data-qa-prefixwrapper
      style={prefixStyle && prefixStyle}
    >
      {prefixComponent}
    </div>
  );
};

export default compose<CombinedProps, Props>(React.memo)(FinalCrumbPrefix);
