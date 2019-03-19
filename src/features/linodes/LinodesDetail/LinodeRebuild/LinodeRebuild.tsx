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
import RebuildFromStackScript from './RebuildFromStackScript';

import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import Radio from 'src/components/Radio';

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

type MODES =
  | 'fromImage'
  | 'fromCommunityStackScript'
  | 'fromAccountStackScript';
const options = [
  { value: 'fromImage', label: 'From Image' },
  { value: 'fromCommunityStackScript', label: 'From Community StackScript' },
  { value: 'fromAccountStackScript', label: 'From Account StackScript' }
];

const LinodeRebuild: React.StatelessComponent<CombinedProps> = props => {
  const { classes, linodeLabel } = props;

  const [mode, setMode] = React.useState<MODES>('fromImage');

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
        <RadioGroup
          aria-label="rebuild modes"
          name="rebuild modes"
          value={mode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMode(e.target.value as MODES)
          }
        >
          {options.map(eachOption => (
            <FormControlLabel
              key={eachOption.value}
              value={eachOption.value}
              label={eachOption.label}
              control={<Radio />}
            />
          ))}
        </RadioGroup>
      </Paper>
      {mode === 'fromImage' && <RebuildFromImage />}
      {mode === 'fromCommunityStackScript' && (
        <RebuildFromStackScript type="community" />
      )}
      {mode === 'fromAccountStackScript' && (
        <RebuildFromStackScript type="account" />
      )}
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
