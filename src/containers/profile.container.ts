import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

import { State } from 'src/store/profile/profile.reducer';

export default <TInner extends {}, TOuter extends {}>(
  mapAccountToProps: (ownProps: TOuter, profile: State) => TInner
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    return mapAccountToProps(ownProps, state.__resources.profile);
  });
