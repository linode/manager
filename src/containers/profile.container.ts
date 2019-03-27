import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export interface ProfileProps {
  profile?: Linode.Profile;
}

export default <TInner extends {}, TOutter extends {}>(
  mapAccountToProps: (ownProps: TOutter, account?: Linode.Profile) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOutter) => {
    const profile = state.__resources.profile.data;

    return mapAccountToProps(ownProps, profile);
  });
