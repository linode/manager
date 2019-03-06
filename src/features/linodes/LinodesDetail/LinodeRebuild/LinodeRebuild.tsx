import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { withLinodeDetailContext } from '../linodeDetailContext';
import RebuildFromImage from './RebuildFromImage';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    padding: theme.spacing.unit * 3
  },
  title: {
    marginBottom: theme.spacing.unit * 2
  }
});

interface ContextProps {
  linodeLabel: string;
}
type CombinedProps = WithStyles<ClassNames> & ContextProps;

const LinodeRebuild: React.StatelessComponent<CombinedProps> = props => {
  const { classes, linodeLabel } = props;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`${linodeLabel} - Rebuild`} />
      <Paper className={classes.root}>
        <Typography
          role="header"
          variant="h2"
          className={classes.title}
          data-qa-title
        >
          Rebuild
        </Typography>
        <Typography data-qa-rebuild-desc>
          If you can't rescue an existing disk, it's time to rebuild your
          Linode. There are a couple of different ways you can do this: either
          restore from a backup or start over with a fresh Linux distribution.
          Rebuilding will destroy all data.
        </Typography>
      </Paper>
      {/* FromImage/FromStackScript <Select /> goes here. The components below
        will be rendered depending on which is selected. */}
      <RebuildFromImage />
      {/* <RebuildFromStackScript />*/}
    </React.Fragment>
  );
};

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeLabel: linode.label
}));

const styled = withStyles(styles);

export default compose<CombinedProps, {}>(
  linodeContext,
  styled
)(LinodeRebuild);
