import { APIError } from '@linode/api-v4/lib/types';
import { connect } from 'react-redux';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ApplicationState } from 'src/store';

export interface WithTypesProps {
  typesData?: ExtendedType[];
  typesLoading: boolean;
  typesError?: APIError[];
}

export default connect((state: ApplicationState, ownProps) => ({
  typesData: state.__resources.types.entities.filter(
    thisType => !thisType.isDeprecated && !thisType.isShadowPlan
  ),
  typesLoading: state.__resources.types?.loading ?? false,
  typesError: state.__resources.types?.error
}));
