import { LinodeType } from 'linode-js-sdk/lib/linodes'
import { compose, filter, map, pathOr } from 'ramda';
import { connect } from 'react-redux';

import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { typeLabelDetails } from 'src/features/linodes/presentation';
import { ApplicationState } from 'src/store';

export interface WithTypesProps {
  typesData?: ExtendedType[];
  typesLoading: boolean;
  typesError?: Linode.ApiFieldError[];
}

export default connect((state: ApplicationState, ownProps) => ({
  typesData: compose(
    map<LinodeType, ExtendedType>(type => {
      const {
        label,
        memory,
        vcpus,
        disk,
        price: { monthly, hourly }
      } = type;
      return {
        ...type,
        heading: label,
        subHeadings: [
          `$${monthly}/mo ($${hourly}/hr)`,
          typeLabelDetails(memory, disk, vcpus)
        ]
      };
    }),
    /* filter out all the deprecated types because we don't to display them */
    filter<any>((eachType: LinodeType) => {
      if (!eachType.successor) {
        return true;
      }
      return eachType.successor === null;
    })
  )(state.__resources.types.entities),
  typesLoading: pathOr(false, ['loading'], state.__resources.types),
  typesError: pathOr(undefined, ['error'], state.__resources.types)
}));
