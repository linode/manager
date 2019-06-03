import * as React from 'react';
import Button, { ButtonProps } from 'src/components/Button';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type CSSClasses = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    backgroundColor: theme.bg.white,
    border: '1px solid ' + `${theme.color.borderPagination}`,
    borderRight: 0,
    padding: theme.spacing(1),
    minWidth: 40,
    height: 40,
    color: theme.palette.primary.main,
    [theme.breakpoints.down('xs')]: {
      minWidth: 27,
      height: 30,
      minHeight: 30,
      fontSize: '0.8rem',
      padding: 5
    },
    '& svg': {
      fontSize: 22,
      [theme.breakpoints.down('xs')]: {
        fontSize: 20
      }
    },
    '&.active': {
      backgroundColor: theme.bg.main,
      color: theme.color.black
    },
    '&:last-child': {
      borderRight: '1px solid ' + `${theme.color.borderPagination}`
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#fff'
    },
    '&:disabled': {
      backgroundColor: theme.bg.main,
      color: theme.color.black
    }
  }
});

const styled = withStyles<CSSClasses>(styles);

/* tslint:disable-next-line */
export interface Props extends ButtonProps {}

const PageButton: React.StatelessComponent<
  Props & WithStyles<CSSClasses>
> = props => {
  const { classes, children, ...rest } = props;

  return (
    <Button className={classes.root} {...rest}>
      {children}
    </Button>
  );
};

export default styled(PageButton);
