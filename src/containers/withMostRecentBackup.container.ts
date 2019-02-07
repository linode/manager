import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export default <TInner extends {}, TOutter extends {}>(
  propsSelector: (ownProps: TOutter) => number,
  mapBackupToProps: (
    ownProps: TOutter,
    mostRecentBackup: string | null
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOutter) => {
    const linodeId = propsSelector(ownProps);

    const linode = state.__resources.linodes.entities.find(
      i => i.id === linodeId
    );

    const mostRecentBackup = linode ? linode.mostRecentBackup : null;

    return mapBackupToProps(ownProps, mostRecentBackup);
  });
