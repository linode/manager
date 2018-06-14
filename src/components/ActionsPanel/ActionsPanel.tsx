import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    paddingTop: 16,
    paddingBottom: 16,
    '& > :not(:first-child)': {
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

export default styled<Props>(ActionPanel);
