import { FormikProps } from 'formik';
import * as React from 'react';

import { placementGroupFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsDrawerContent } from './PlacementGroupsDrawerContent';

import type { PlacementGroupDrawerFormikProps } from './types';

describe('PlacementGroupsDrawerContent', () => {
  it('should render the right form elements', () => {
    const { getByLabelText, getByRole } = renderWithTheme(
      <PlacementGroupsDrawerContent
        formik={
          ({
            errors: {},
            resetForm: vi.fn(),
            values: {
              affinity_type: 'affinity',
              label: '',
              region: '',
            },
          } as unknown) as FormikProps<PlacementGroupDrawerFormikProps>
        }
        mode="create"
        onClose={vi.fn()}
        open={true}
        regions={[]}
        selectedPlacementGroup={placementGroupFactory.build()}
        setHasFormBeenSubmitted={vi.fn()}
      />
    );

    expect(getByLabelText('Label')).toBeInTheDocument();
    expect(getByLabelText('Region')).toBeInTheDocument();
    expect(getByLabelText('Affinity Type')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Create Placement Group' })
    ).toBeInTheDocument();
  });
});
