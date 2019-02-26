import * as classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'root' | 'selected';

const styles: StyleRulesCallback<ClassNames> = (theme: any) => ({
  root: {
    ...theme.overrides.MuiTab.root
  },
  selected: {}
});

interface Props {
  to: string;
  title: string;
  selected?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

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
        tabIndex={0}
        aria-selected={pathName === to}
        data-qa-tab={title}
      >
        {title}
      </Link>
    );
  }
}

const styled = withStyles<ClassNames>(styles);

export default styled(TabLink);
