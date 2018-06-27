import * as React from 'react';

import * as classnames from 'classnames';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';

import Button from 'src/components/Button';

type CSSClasses = 'root' | 'first' | 'last'| 'active';

const styles: StyleRulesCallback<CSSClasses> = (theme: Linode.Theme) => ({
  root: {
    backgroundColor: theme.bg.offWhite,
    border: '1px solid ' + `${theme.color.grey3}`,
    borderRight: 0,
    padding: theme.spacing.unit,
    minWidth: 40,
    minHeight: 40,
    '& svg': {
      fontSize: 22,
    },
    '&.active': {
      backgroundColor: theme.bg.main,
      color: 'black',
    },
    '&:last-child': {
      borderRight: '1px solid ' + `${theme.color.grey3}`,
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
  onClick: (page?: number) => void;
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

  const handlePageChange = () => {
    const isCurrentPage = props.active;
    if (!isCurrentPage) { // only want to allow clicking if we're clicking a different page
      onClick(props.page);
    }
  }

  if (first) {
    return (
    <Button
      className={`
        ${rootClasses}
        ${classes.first}
      `}
      onClick={handlePageChange}
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
      className={`
        ${rootClasses}
        ${classes.last}
      `}
      onClick={handlePageChange}
      disabled={disabled}
      data-qa-next-page
    >
      <KeyboardArrowRight />
    </Button>
    );
  }

  return (
    <Button
      className={rootClasses}
      onClick={handlePageChange}
      data-qa-page-to={page}>
      {page}
    </Button>
  );
});

export default styled(PageButton);
