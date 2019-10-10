import * as React from 'react';

import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { sanitizeHTML } from 'src/utilities/sanitize-html';


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

interface Props {
  icon: any;
  title: string;
  tips: string[];
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
        {tips.map((tip, idx) => (
          <Grid item key={`${title}-tip-item-${idx}`}>
            <Typography
            className={classes.title}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(tip) }}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(TipSection);
