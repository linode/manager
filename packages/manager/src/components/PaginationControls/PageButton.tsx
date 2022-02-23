import * as React from 'react';
import Button, { ButtonProps } from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.bgPaper,
    borderRadius: 1,
    color: theme.textColors.tableHeader,
    fontSize: '.875rem',
    height: 28,
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    minWidth: 28,
    padding: 6,
    [theme.breakpoints.down('xs')]: {
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
      color: theme.textColors.tableStatic,
    },
    '&:hover': {
      background: theme.color.grey9,
      color: theme.textColors.linkActiveLight,
    },
  },
}));

/* tslint:disable-next-line */
export interface Props extends ButtonProps {}

const PageButton: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { children, ...rest } = props;

  return (
    <Button className={classes.root} {...rest}>
      {children}
    </Button>
  );
};

export default PageButton;
