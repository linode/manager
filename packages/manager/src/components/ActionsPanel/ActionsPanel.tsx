import * as classNames from 'classnames';
import { compose } from 'ramda';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root' | 'rightAlign';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      '& > button': {
        marginBottom: theme.spacing(1),
      },
      '& > :first-child': {
        marginRight: theme.spacing(),
        marginLeft: 0,
      },
      '& > :only-child': {
        marginRight: 0,
      },
    },
    rightAlign: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
  });

interface Props {
  className?: string;
  style?: any;
  rightAlign?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ActionPanel: React.FC<CombinedProps> = (props) => {
  const { classes, className, style, rightAlign } = props;

  return (
    <div
      data-qa-buttons
      className={classNames({
        [classes.root]: true,
        [classes.rightAlign]: rightAlign,
        ...(className && { [className]: true }),
        actionPanel: true,
      })}
      style={style}
    >
      {props.children}
    </div>
  );
};

const styled = withStyles(styles);

export default compose<any, any, any>(styled, RenderGuard)(ActionPanel);
