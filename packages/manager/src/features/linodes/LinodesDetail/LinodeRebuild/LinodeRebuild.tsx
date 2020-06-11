import { GrantLevel } from '@linode/api-v4/lib/account';
import { LinodeStatus } from '@linode/api-v4/lib/linodes';
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
import HostMaintenanceError from '../HostMaintenanceError';
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
  linodeStatus: LinodeStatus;
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

const passwordHelperText = 'Set a password for your rebuilt Linode.';

const LinodeRebuild: React.FC<CombinedProps> = props => {
  const { classes, linodeLabel, linodeStatus, permissions } = props;
  const hostMaintenance = linodeStatus === 'stopped';
  const unauthorized = permissions === 'read_only';
  const disabled = hostMaintenance || unauthorized;

  const [mode, setMode] = React.useState<MODES>('fromImage');

  return (
    <div id="tabpanel-rebuild" role="tabpanel" aria-labelledby="tab-rebuild">
      <DocumentTitleSegment segment={`${linodeLabel} - Rebuild`} />
      <Paper className={classes.root}>
        {unauthorized && <LinodePermissionsError />}
        {hostMaintenance && <HostMaintenanceError />}
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
          If you can&#39;t rescue an existing disk, it&#39;s time to rebuild
          your Linode. There are a couple of different ways you can do restore
          from a backup or start over with a fresh Linux distribution.&nbsp;
          <strong>
            Rebuilding will destroy all data on all existing disks on this
            Linode.
          </strong>
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
      {mode === 'fromImage' && (
        <RebuildFromImage
          passwordHelperText={passwordHelperText}
          disabled={disabled}
        />
      )}
      {mode === 'fromCommunityStackScript' && (
        <RebuildFromStackScript
          type="community"
          passwordHelperText={passwordHelperText}
          disabled={disabled}
        />
      )}
      {mode === 'fromAccountStackScript' && (
        <RebuildFromStackScript
          type="account"
          passwordHelperText={passwordHelperText}
          disabled={disabled}
        />
      )}
    </div>
  );
};

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeLabel: linode.label,
  linodeStatus: linode.status,
  permissions: linode._permissions
}));

const styled = withStyles(styles);

export default compose<CombinedProps, {}>(linodeContext, styled)(LinodeRebuild);
