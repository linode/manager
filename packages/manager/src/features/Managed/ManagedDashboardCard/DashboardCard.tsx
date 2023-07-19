import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Typography } from 'src/components/Typography';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(3),
  },
  header: {
    padding: theme.spacing(3),
    paddingBottom: 0,
  },
  headerAction: {
    left: `-${theme.spacing(2)}`,
    marginLeft: theme.spacing(0.5),
    position: 'relative',
    top: 6,
  },
  root: {
    width: '100% !important',
  },
}));

interface Props {
  alignHeader?: 'flex-start' | 'space-between';
  alignItems?: 'center' | 'flex-start';
  className?: string;
  headerAction?: () => JSX.Element | JSX.Element[] | null;
  noHeaderActionStyles?: boolean;
  title?: string;
}

const DashboardCard: React.FC<Props> = (props) => {
  const { classes, cx } = useStyles();

  const {
    alignHeader,
    alignItems,
    className,
    headerAction,
    noHeaderActionStyles,
    title,
  } = props;

  return (
    <Grid
      className={cx(className, {
        [classes.container]: true,
        [classes.root]: true,
      })}
      container
      data-qa-card={title}
      spacing={2}
    >
      {(title || headerAction) && (
        <Grid xs={12}>
          <Grid
            alignItems={alignItems || 'flex-start'}
            className={classes.header}
            container
            justifyContent={alignHeader || 'space-between'}
            spacing={2}
          >
            {title && (
              <Grid className={'p0'}>
                <Typography variant="h2">{title}</Typography>
              </Grid>
            )}
            {headerAction && (
              <Grid className={'p0'}>
                <Typography
                  className={
                    !noHeaderActionStyles ? classes.headerAction : undefined
                  }
                  variant="body1"
                >
                  {headerAction()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
      <Grid xs={12}>{props.children}</Grid>
    </Grid>
  );
};

export default DashboardCard;
