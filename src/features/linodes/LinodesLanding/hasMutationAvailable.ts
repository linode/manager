import { connect, MapStateToProps } from 'react-redux';
import getLinodeType from 'src/utilities/getLinodeType';

export interface HasMutationAvailable {
  mutationAvailable: boolean;
}

const hasMutation = (type?: null | Linode.LinodeType) => {
  if (!type) {
    return false;
  }

  return !!type.successor;
}

const mapStateToProps: MapStateToProps<HasMutationAvailable, { linodeType: string }, ApplicationState> = (state, ownProps) => {
  const { linodeType } = ownProps;
  const { entities, results } = state.__resources.types;
  const type = getLinodeType(entities, results, linodeType);

  return ({
    mutationAvailable: hasMutation(type),
  })
};

export default connect(mapStateToProps);
