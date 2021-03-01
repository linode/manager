import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface BackupCTAProps {
  backupsCTA: boolean;
}

export default connect((state: ApplicationState) => ({
  backupsCTA:
    Object.values(state.__resources.linodes.itemsById).some(
      (l) => !l.backups.enabled
    ) && !(state?.__resources?.accountSettings?.data?.managed ?? false),
}));
