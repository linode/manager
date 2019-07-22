import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export default <TInner extends {}, TOuter extends {}>(
  propsSelector: (ownProps: TOuter) => number,
  mapBackupToProps: (
    ownProps: TOuter,
    mostRecentBackup: string | null
  ) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const linodeId = propsSelector(ownProps);

    const linode = state.__resources.linodes.entities.find(
      i => i.id === linodeId
    );

    const mostRecentBackup = linode ? linode.mostRecentBackup : null;

    return mapBackupToProps(ownProps, mostRecentBackup);
  });
