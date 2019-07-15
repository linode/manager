import * as React from 'react';

import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';

type ClassNames = 'root' | 'icon' | 'link' | 'title';

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
    link: {
      marginLeft: 32,
      fontSize: '1em',
      lineHeight: 2
    },
    title: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    }
  });

interface Link {
  href: string;
  title: string;
}

interface Props {
  icon: any;
  title: string;
  links: Link[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const LinkSection: React.FunctionComponent<CombinedProps> = props => {
  const { classes, icon, links, title } = props;
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
      <Grid container item className={classes.link}>
        {links.map((link, idx) => (
          <Grid item key={`${title}-link-item-${idx}`}>
            <Typography className={classes.title}>
              <ExternalLink link={link.href} text={link.title} />
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(LinkSection);
