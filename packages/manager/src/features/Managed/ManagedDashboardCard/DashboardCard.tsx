import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    width: '100% !important',
  },
  container: {
    marginTop: theme.spacing(3),
  },
  header: {
    padding: theme.spacing(3),
    paddingBottom: 0,
  },
  headerAction: {
    position: 'relative',
    top: 6,
    left: `-${theme.spacing(2)}`,
    marginLeft: theme.spacing(0.5),
  },
}));

interface Props {
  title?: string;
  className?: string;
  alignHeader?: 'flex-start' | 'space-between';
  alignItems?: 'center' | 'flex-start';
  headerAction?: () => JSX.Element | JSX.Element[] | null;
  noHeaderActionStyles?: boolean;
}

const DashboardCard: React.FC<Props> = (props) => {
  const { classes, cx } = useStyles();

  const {
    alignHeader,
    title,
    headerAction,
    noHeaderActionStyles,
    className,
    alignItems,
  } = props;

  return (
    <Grid
      container
      className={cx(className, {
        [classes.root]: true,
        [classes.container]: true,
      })}
      data-qa-card={title}
      spacing={2}
    >
      {(title || headerAction) && (
        <Grid xs={12}>
          <Grid
            container
            className={classes.header}
            alignItems={alignItems || 'flex-start'}
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
                  variant="body1"
                  className={
                    !noHeaderActionStyles ? classes.headerAction : undefined
                  }
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
