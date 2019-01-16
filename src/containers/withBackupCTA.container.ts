import { connect } from 'react-redux';

export interface BackupCTAProps {
  backupsCTA: boolean;
}

export default connect((state: ApplicationState, ownProps) => ({
  backupsCTA: state.__resources.linodes.entities.filter(l => !l.backups.enabled).length > 0
}));