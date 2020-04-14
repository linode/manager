import { LinodeType } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { connect } from 'react-redux';

import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { ApplicationState } from 'src/store';

export interface WithTypesProps {
  typesData?: ExtendedType[];
  typesLoading: boolean;
  typesError?: APIError[];
}

export const extendTypes = (types: LinodeType[]): ExtendedType[] => {
  return (
    types
      .map(thisType => {
        const {
          label,
          memory,
          vcpus,
          disk,
          price: { monthly, hourly }
        } = thisType;
        return {
          ...thisType,
          heading: label,
          subHeadings: [
            `$${monthly}/mo ($${hourly}/hr)`,
            typeLabelDetails(memory, disk, vcpus)
          ] as [string, string]
        };
      })
      /* filter out all the deprecated types because we don't to display them */
      .filter((eachType: ExtendedType) => {
        if (!eachType.successor) {
          return true;
        }
        return eachType.successor === null;
      })
  );
};

export default connect((state: ApplicationState, ownProps) => ({
  typesData: extendTypes(state.__resources.types.entities),
  typesLoading: state.__resources.types?.loading ?? false,
  typesError: state.__resources.types?.error
}));
