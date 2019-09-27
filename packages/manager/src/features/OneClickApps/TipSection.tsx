import * as React from 'react';

import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'icon' | 'tip' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(4)
    },
    icon: {
      width: 24,
      position: 'relative',
      top: 2,
      marginRight: 8,
      color: theme.color.headline
    },
    tip: {
      marginLeft: 32,
      fontSize: '1em',
      lineHeight: 2
    },
    title: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    }
  });

interface Info {
  tip: string
}

interface Props {
  icon: any;
  title: string;
  tips: Info[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const TipSection: React.FunctionComponent<CombinedProps> = props => {
  const { classes, icon, tips, title } = props;
  const Icon = icon;

  return (
    <Grid container item className={classes.root}>
      <Grid
        container
        item
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item>
          <Icon className={classes.icon} />
        </Grid>
        <Grid item>
          <Typography variant="h3">{title}</Typography>
        </Grid>
      </Grid>
      <Grid container item className={classes.tip}>
        {tips.map((additional_info, idx) => (
          <Grid item key={`${title}-tip-item-${idx}`}>
            <Typography className={classes.title}>
             {additional_info.tip}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(TipSection);
