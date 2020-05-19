import * as classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'root' | 'selected';

const styles = (theme: any) =>
  createStyles({
    root: {
      ...theme.overrides.MuiTab.root
    },
    selected: {}
  });

interface Props {
  to: string;
  title: string;
  selected?: boolean;
  ref?: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const convertForAria = (str: string) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/([^A-Z0-9]+)(.)/gi, (match, p1, p2) => p2.toUpperCase());
};

class TabLink extends React.Component<CombinedProps> {
  render() {
    const { classes, title, to } = this.props;
    const pathName = document.location.pathname;

    return (
      <Link
        to={to}
        className={classNames({
          [classes.root]: true,
          [classes.selected]: pathName === to
        })}
        role="tab"
        id={`tab-${convertForAria(title)}`}
        aria-controls={`tabpanel-${convertForAria(title)}`}
        tabIndex={0}
        aria-selected={pathName === to}
        data-qa-tab={title}
      >
        {title}
      </Link>
    );
  }
}

const styled = withStyles(styles);

export default styled(TabLink);
