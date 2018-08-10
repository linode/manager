import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';

import DocComponent, { Doc } from './DocComponent';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  title: {
    fontSize: '1.5rem',
    color: theme.color.green,
  },
});

interface Props {
  docs: Doc[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const styled = withStyles(styles, { withTheme: true });

class DocsSidebar extends React.Component<CombinedProps>  {
  render() {
    const { classes, docs } = this.props;

    if (docs.length === 0) {
      return null;
    }

    return (
      <Grid item className="mlSidebar">
        <Typography
          role="header"
          variant="title"
          className={classes.title}
          data-qa-sidebar-title
        >
          Linode Docs
        </Typography>
        {
          docs.map((doc, idx) => <DocComponent key={idx} {...doc} />)
        }
      </Grid>
    );
  }
}

export default styled<Props>(DocsSidebar);
