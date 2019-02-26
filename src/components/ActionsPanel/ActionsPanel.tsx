import * as classNames from 'classnames';
import { compose } from 'ramda';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit,
    '& > button': {
      marginBottom: theme.spacing.unit
    },
    '& > :first-child': {
      marginRight: theme.spacing.unit
    }
  }
});

interface Props {
  className?: string;
  style?: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ActionPanel: React.StatelessComponent<CombinedProps> = props => {
  const { classes, className, style } = props;

  return (
    <div
      className={classNames({
        [classes.root]: true,
        ...(className && { [className]: true }),
        actionPanel: true
      })}
      style={style}
    >
      {props.children}
    </div>
  );
};

const styled = withStyles(styles);

export default compose<any, any, any>(
  styled,
  RenderGuard
)(ActionPanel);
