import * as classNames from 'classnames';
import { compose } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    paddingTop: 16,
    paddingBottom: 16,
    '& > :not(:first-child):not([data-qa-paypal-button])': {
      marginLeft: 8,
    },
  },
});

interface Props {
  className?: string;
  style?: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ActionPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, className, style } = props;

  return (
    <div
      className={classNames({
        [classes.root]: true,
        ...(className && { [className]: true }),
        actionPanel: true,
      })}
      style={style}
    >
      { props.children }
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  styled,
  RenderGuard
  )(ActionPanel);
