import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Button, { ButtonProps } from 'src/components/Button';

type CSSClasses = 'root';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
  root: {
    backgroundColor: theme.bg.offWhiteDT,
    border: '1px solid ' + `${theme.color.borderPagination}`,
    borderRight: 0,
    padding: theme.spacing.unit,
    minWidth: 40,
    minHeight: 40,
    color: theme.palette.text.primary,
    '& svg': {
      fontSize: 22,
    },
    '&.active': {
      backgroundColor: theme.bg.main,
      color: theme.color.black,
    },
    '&:last-child': {
      borderRight: '1px solid ' + `${theme.color.borderPagination}`,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
    },
    '&$disabled': {
      color: '#ccc',
    },
  },
});

const styled = withStyles<CSSClasses>(styles, { withTheme: true });

/* tslint:disable-next-line */
export interface Props extends ButtonProps { }

const PageButton: React.StatelessComponent<Props & WithStyles<CSSClasses>> = ((props) => {
  const { classes, children, ...rest } = props;

  return (
    <Button className={classes.root} {...rest}>
      {children}
    </Button>
  );
});

export default styled(PageButton);
