import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

type MapProps<TOuter, TInner> = (
  ownProps: TOuter,
  linodes: Linode.Linode[],
  loading: boolean,
  error?: Linode.ApiFieldError[]
) => TInner;

export default <TInner extends {}, TOuter extends {}>(
  mapToProps: MapProps<TOuter, TInner>
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const { loading, error, entities } = state.__resources.linodes;

    return mapToProps(ownProps, entities, loading, error);
  });
