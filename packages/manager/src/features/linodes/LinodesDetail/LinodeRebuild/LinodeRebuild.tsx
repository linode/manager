import { GrantLevel } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { compose } from 'recompose';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import RebuildFromImage from './RebuildFromImage';
import RebuildFromStackScript from './RebuildFromStackScript';

type ClassNames = 'root' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3)
    },
    title: {
      marginBottom: theme.spacing(2)
    }
  });

interface ContextProps {
  linodeLabel: string;
  permissions: GrantLevel;
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

const LinodeRebuild: React.FC<CombinedProps> = props => {
  const { classes, linodeLabel, permissions } = props;
  const disabled = permissions === 'read_only';

  const [mode, setMode] = React.useState<MODES>('fromImage');

  return (
    <div id="tabpanel-rebuild" role="tabpanel" aria-labelledby="tab-rebuild">
      <DocumentTitleSegment segment={`${linodeLabel} - Rebuild`} />
      <Paper className={classes.root}>
        {disabled && <LinodePermissionsError />}
        <Typography
          role="heading"
          aria-level={2}
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
          Rebuilding will destroy all data on all existing disks on this Linode.
        </Typography>
        <EnhancedSelect
          options={options}
          defaultValue={options[0]}
          onChange={(selected: Item<MODES>) => setMode(selected.value)}
          isClearable={false}
          disabled={disabled}
          label="From Image"
          hideLabel
        />
      </Paper>
      {mode === 'fromImage' && <RebuildFromImage />}
      {mode === 'fromCommunityStackScript' && (
        <RebuildFromStackScript type="community" />
      )}
      {mode === 'fromAccountStackScript' && (
        <RebuildFromStackScript type="account" />
      )}
    </div>
  );
};

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeLabel: linode.label,
  permissions: linode._permissions
}));

const styled = withStyles(styles);

export default compose<CombinedProps, {}>(linodeContext, styled)(LinodeRebuild);
