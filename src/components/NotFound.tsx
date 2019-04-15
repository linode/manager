import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import LinodePac from 'src/components/LinodePac';
import Placeholder from 'src/components/Placeholder';

import IconError from 'src/assets/icons/error.svg';

type ClassNames = 'root' | 'placeholder';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  placeholder: {
    '& svg': {
      color: theme.palette.text.primary,
      width: 60,
      height: 60
    }
  }
});

interface Props {
  className?: string;
}

const NotFound = (props: Props & WithStyles<ClassNames>) => {
  const { classes } = props;
  return (
    <>
      <Hidden mdUp>
        <Placeholder
          icon={IconError}
          title="Oops, 404"
          copy="Let's try something else?"
          className={classes.placeholder}
        />
      </Hidden>
      <Hidden smDown implementation="css">
        <LinodePac />
      </Hidden>
    </>
  );
};

const styled = withStyles<ClassNames>(styles);

export default styled(NotFound);
