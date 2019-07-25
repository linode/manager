import * as classNames from 'classnames';
import { compose } from 'ramda';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      '& > *': {
        marginTop: theme.spacing(1)
      },
      '& > :first-child': {
        marginRight: theme.spacing(1)
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
