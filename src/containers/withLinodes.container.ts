import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

type MapProps<TOutter, TInner> = (
  ownProps: TOutter,
  linodes: Linode.Linode[],
  loading: boolean,
  error?: Linode.ApiFieldError[],
) => TInner;

export default <TInner extends {}, TOutter extends {}>(mapToProps: MapProps<TOutter, TInner>,
) => connect((state: ApplicationState, ownProps: TOutter) => {
  const { loading, error, entities } = state.__resources.linodes;

  return mapToProps(ownProps, entities, loading, error);
});

