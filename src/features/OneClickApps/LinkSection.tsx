import * as React from 'react';

import Grid from 'src/components/core/Grid';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'icon' | 'link' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginTop: theme.spacing.unit * 4
  },
  icon: {
    fontSize: '2em',
    marginRight: theme.spacing.unit
  },
  link: {
    marginLeft: theme.spacing.unit * 4,
    fontSize: '1.1em',
    lineHeight: 2
  },
  title: {
    fontSize: '1.2em'
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
          <Typography className={classes.title}>{title}</Typography>
        </Grid>
      </Grid>
      <Grid container item className={classes.link}>
        {links.map((link, idx) => (
          <Grid item key={`${title}-link-item-${idx}`}>
            <a href={link.href}>{link.title}</a>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles);

export default styled(LinkSection);
