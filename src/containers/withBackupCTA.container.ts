import { pathOr } from 'ramda';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface BackupCTAProps {
  backupsCTA: boolean;
}

export default connect((state: ApplicationState, ownProps) => ({
  backupsCTA:
    state.__resources.linodes.entities.filter(l => !l.backups.enabled).length >
      0 &&
    !pathOr(false, ['__resources', 'accountSettings', 'data', 'managed'], state)
}));
