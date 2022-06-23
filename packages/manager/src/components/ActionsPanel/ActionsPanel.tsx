import classNames from 'classnames';
import { compose } from 'ramda';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root';

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
  });

interface Props {
  className?: string;
  style?: React.CSSProperties;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ActionPanel: React.FC<CombinedProps> = (props) => {
  const { classes, className, style, children } = props;

  return (
    <div
      data-qa-buttons
      className={classNames({
        [classes.root]: true,
        ...(className && { [className]: true }),
        actionPanel: true,
      })}
      style={style}
    >
      {Array.isArray(children)
        ? [...children].sort((child) =>
            child?.props?.buttonType === 'primary' ? 1 : -1
          ) // enforce that the primary button will always be to the right
        : children}
    </div>
  );
};

const styled = withStyles(styles);

export default compose<any, any, any>(styled, RenderGuard)(ActionPanel);
