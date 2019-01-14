import { connect } from 'react-redux';
import { MapState } from 'src/store/types';
import getLinodeType from 'src/utilities/getLinodeType';

export interface WithDisplayType {
  displayType: string;
}

const mapStateToProps: MapState<WithDisplayType, { linodeType: string }> = (state, ownProps) => {
  const { linodeType } = ownProps;
  const { entities, results } = state.__resources.types;
  const type = getLinodeType(entities, results, linodeType);

  return ({
    displayType:
      type === null
        ? 'No Plan'
        : type === undefined
          ? 'Unknown Plan'
          : type.label,
  })
};

export default connect(mapStateToProps);
