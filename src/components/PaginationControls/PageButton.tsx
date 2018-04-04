import * as React from 'react';
import * as classnames from 'classnames';
import { withStyles, Theme, StyleRulesCallback, WithStyles, Button } from 'material-ui';
import LinodeTheme from '../../../src/theme';

import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';

type CSSClasses = 'root' | 'first' | 'last'| 'active';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  root: {
    backgroundColor: LinodeTheme.bg.offWhite,
    border: '1px solid ' + `${LinodeTheme.color.grey3}`,
    borderRight: 0,
    padding: theme.spacing.unit,
    minWidth: 40,
    minHeight: 40,
    '& svg': {
      fontSize: 22,
    },
    '&.active': {
      backgroundColor: LinodeTheme.bg.main,
      color: 'black',
    },
    '&:last-child': {
      borderRight: '1px solid ' + `${LinodeTheme.color.grey3}`,
    },
  },
  active: {},
  first: {},
  last: {},
});

const styled = withStyles<CSSClasses>(styles, { withTheme: true });

interface Props {
  active?: boolean;
  page?: number;
  first?: boolean;
  last?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const PageButton: React.StatelessComponent<Props & WithStyles<CSSClasses>> = ((props) => {
  const {
    active,
    classes,
    page,
    first,
    last,
    onClick,
    disabled,
  } = props;

  const rootClasses = classnames({
    [classes.root]: true,
    // TSLint and the typedefs for classnames are preventing me from using shorthand here.
    active: active === true,
  });

  if (first) {
    return (
    <Button
      className={`${rootClasses}
      ${classes.first}` }
      onClick={onClick}
      disabled={disabled}
      data-qa-previous-page
    >
      <KeyboardArrowLeft />
    </Button>
    );
  }

  if (last) {
    return (
    <Button
      className={`${rootClasses}
      ${classes.last}` }
      onClick={onClick}
      disabled={disabled}
      data-qa-next-page
    >
      <KeyboardArrowRight />
    </Button>
    );
  }

  return (
    <Button className={rootClasses} onClick={onClick} data-qa-page-to={page}>{page}</Button>
  );
});

export default styled(PageButton);
