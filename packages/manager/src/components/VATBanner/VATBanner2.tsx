import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';

import useFlags from 'src/hooks/useFlags';

const useStyles = makeStyles({
  root: {}
});

interface Props {
  hello?: string;
}

type CombinedProps = Props;

const VATBanner: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const flags = useFlags();

  return <div className={classes.root}>{flags && flags.buttonColor}</div>;
};

export default compose<CombinedProps, Props>(React.memo)(VATBanner);
