import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  actions: {
    '& button.primary': {
      borderRadius: 3,
      height: 40,
      padding: 0,
      width: 152
    },
    '& .iconTextLink': {
      alignItems: 'center',
      borderLeft: '1px solid #f4f5f6',
      height: 50,
      marginRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),

      minWidth: 'auto',
      padding: 0,
      '& svg': {
        marginRight: theme.spacing(1.5)
      }
    }
  }
}));

export interface HeaderProps extends BreadCrumbProps {
  actions: JSX.Element;
}

export const LandingHeader: React.FC<HeaderProps> = props => {
  const { actions, iconType, parentLink, parentText, title } = props;
  const classes = useStyles();

  return (
    <Grid
      container
      alignItems="center"
      justify="space-between"
      className={classes.root}
    >
      <Grid item>
        <Grid container direction="row" alignItems="center">
          <HeaderBreadCrumb
            iconType={iconType}
            title={title}
            parentLink={parentLink}
            parentText={parentText}
          />
          {props.children && <Grid item>{props.children}</Grid>}
        </Grid>
      </Grid>
      <Grid className={classes.actions} item>
        {actions}
      </Grid>
    </Grid>
  );
};

export default LandingHeader;
