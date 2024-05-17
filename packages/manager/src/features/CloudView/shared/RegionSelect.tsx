/* eslint-disable no-console */
import * as React from 'react';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useRegionsQuery } from 'src/queries/regions';

export interface CloudViewRegionSelectProps {
  defaultValue?: string;
  handleRegionChange: (region: string | undefined) => void;
}

export const CloudViewRegionSelect = React.memo(
  (props: CloudViewRegionSelectProps) => {
    const { data: regions } = useRegionsQuery();
    const defaultCalls = React.useRef(false);

    const getPrefferedRegion = () => {
      if (!defaultCalls.current) {
        defaultCalls.current = true;
        props.handleRegionChange(props.defaultValue);
      }
      return props.defaultValue;
    };

    return (
      <RegionSelect
        handleSelection={(value) => {
          props.handleRegionChange(value);
        }}
        currentCapability={undefined}
        fullWidth
        isClearable={false}
        label=""
        noMarginTop
        regions={regions ? regions : []}
        selectedId={getPrefferedRegion()!}
      />
    );
  }
);
