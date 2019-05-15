import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface ProfileProps {
  profile?: Linode.Profile;
}

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps: (ownProps: TOuter, account?: Linode.Profile) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const profile = state.__resources.profile.data;

    return mapAccountToProps(ownProps, profile);
  });
