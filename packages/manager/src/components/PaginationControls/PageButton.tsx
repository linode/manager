import * as React from 'react';
import Button, { ButtonProps } from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.cmrBGColors.bgPaper,
    borderRadius: 1,
    color: theme.cmrTextColors.tableHeader,
    height: 32,
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    minWidth: 32,
    padding: theme.spacing(),
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.875rem',
      height: 30,
      minHeight: 30,
      minWidth: 27,
      padding: 5,
    },
    '& svg': {
      fontSize: 22,
      [theme.breakpoints.down('xs')]: {
        fontSize: 20,
      },
    },
    '&:disabled': {
      background: theme.color.grey6,
      color: theme.cmrTextColors.tableStatic,
    },
    '&:hover': {
      background: theme.color.grey9,
      color: theme.cmrTextColors.linkActiveLight,
    },
  },
}));

/* tslint:disable-next-line */
export interface Props extends ButtonProps {}

const PageButton: React.FC<Props> = props => {
  const classes = useStyles();

  const { children, ...rest } = props;

  return (
    <Button className={classes.root} {...rest}>
      {children}
    </Button>
  );
};

export default PageButton;
