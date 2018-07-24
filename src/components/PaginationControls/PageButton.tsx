import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Button, { ButtonProps } from 'src/components/Button';

type CSSClasses = 'root';

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
});

const styled = withStyles<CSSClasses>(styles, { withTheme: true });

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
