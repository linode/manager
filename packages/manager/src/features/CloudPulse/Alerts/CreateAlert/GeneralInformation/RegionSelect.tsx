import { useFormikContext } from 'formik';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions/regions';

export interface CloudViewRegionSelectProps {
  /**
   * name used for the component to set formik field
   */
  name: string;
}

export const CloudPulseRegionSelect = React.memo(
  (props: CloudViewRegionSelectProps) => {
    const { name } = props;
    const { data: regions } = useRegionsQuery();
    const formik = useFormikContext();
    const values = formik.getFieldProps(name);
    return (
      <Box onBlur={() => formik.setFieldTouched(`${name}`, true)}>
        <RegionSelect
          onBlur={(event) => {
            formik.handleBlur(event);
            formik.setFieldTouched(`${name}`, true);
          }}
          onChange={(_, value) => {
            formik.setFieldValue(`${name}`, value ? value.id : '');
          }}
          currentCapability={undefined}
          disableClearable={false}
          fullWidth
          label="Region"
          noMarginTop
          regions={regions ?? []}
          value={values.value ?? null}
        />
      </Box>
    );
  }
);
