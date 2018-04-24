import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRulesCallback,
} from 'material-ui/styles';
import Grid from 'src/components/Grid';
import Typography from 'material-ui/Typography';
import LinodeTheme from 'src/theme';

import DocComponent, { Doc } from './DocComponent';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
  title: {
    fontSize: '1.5rem',
    color: LinodeTheme.color.green,
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
