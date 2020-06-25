import * as React from 'react';
import Grid from 'src/components/Grid';
import { makeStyles, Theme } from 'src/components/core/styles';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

export interface HeaderProps extends BreadCrumbProps {
  actions: JSX.Element;
  body: JSX.Element;
  title: string | JSX.Element;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.white
  },
  contentOuter: {
    '& .MuiChip-root': {
      height: 30,
      borderRadius: 15,
      marginTop: 1,
      marginRight: 10,
      fontSize: '.875rem',
      letterSpacing: '.5px',
      minWidth: 120
    }
  }
}));

export const EntityHeader: React.FC<HeaderProps> = props => {
  const { actions, body, iconType, parentLink, parentText, title } = props;
  const classes = useStyles();

  return (
    <Grid
      container
      alignItems="center"
      justify="space-between"
      className={classes.root}
    >
      <Grid item xs={6}>
        <Grid container direction="row" alignItems="center">
          <HeaderBreadCrumb
            iconType={iconType}
            title={title}
            parentLink={parentLink}
            parentText={parentText}
          />
          {body && (
            <Grid className={classes.contentOuter} item>
              {body}
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid container item xs={6} justify="flex-end" alignItems="center">
        {actions}
      </Grid>
    </Grid>
  );
};

export default EntityHeader;
