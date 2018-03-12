import * as React from 'react';
import * as classnames from 'classnames';
import { withStyles, Theme, StyleRulesCallback, WithStyles } from 'material-ui';

type CSSClasses = 'root' | 'first' | 'last'| 'active';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {},
  active: {},
  first: {},
  last: {},
});

const styled = withStyles<CSSClasses>(styles, { withTheme: true });

interface Props {
  active?: Boolean;
  page?: number; 
  first?: Boolean;
  last?: Boolean;
  onClick: () => void;
}

const PageButton: React.StatelessComponent<Props & WithStyles<CSSClasses>> = ((props) => {
  const {
    active,
    classes,
    page,
    first,
    last,
    onClick,
  } = props;

  const rootClasses = classnames({
    [classes.root]: true,
    // TSLint and the typedefs for classnames are preventing me from using shorthand here.
    active: active === true,
  });

  if (first) {
    return <div className={classes.first} onClick={onClick}>First</div>;
  }

  if (last) {
    return <div className={classes.last} onClick={onClick}>Last</div>;
  }

  return (
    <div className={rootClasses} onClick={onClick}>{page}</div>
  );
});

export default styled(PageButton);
