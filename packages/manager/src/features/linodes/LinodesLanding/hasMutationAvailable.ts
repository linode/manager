import { LinodeType } from 'linode-js-sdk/lib/linodes'
import { connect } from 'react-redux';
import { MapState } from 'src/store/types';
import getLinodeType from 'src/utilities/getLinodeType';

export interface HasMutationAvailable {
  mutationAvailable: boolean;
}

const hasMutation = (type?: null | LinodeType) => {
  if (!type) {
    return false;
  }

  return !!type.successor;
};

const mapStateToProps: MapState<
  HasMutationAvailable,
  { linodeType: string }
> = (state, ownProps) => {
  const { linodeType } = ownProps;
  const { entities, results } = state.__resources.types;
  const type = getLinodeType(entities, results, linodeType);

  return {
    mutationAvailable: hasMutation(type)
  };
};

export default connect(mapStateToProps);
