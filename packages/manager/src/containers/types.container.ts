import { APIError } from '@linode/api-v4/lib/types';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';

export interface WithTypesProps {
  typesData: ExtendedType[];
  typesLoading: boolean;
  typesError?: APIError[];
}

export default connect((state: ApplicationState) => {
  return {
    typesData: state.__resources.types.entities,
    typesLoading: state.__resources.types?.loading ?? false,
    typesError: state.__resources.types?.error
  };
});
