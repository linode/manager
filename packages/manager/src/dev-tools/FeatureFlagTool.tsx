import * as React from 'react';
import { useDispatch } from 'react-redux';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { Flags, FlagSet } from 'src/featureFlags';
import { Dispatch } from 'src/hooks/types';
import useFlags from 'src/hooks/useFlags';
import { setMockFeatureFlags } from 'src/store/mockFeatureFlags';

const options: { label: string; flag: keyof Flags }[] = [
  { label: 'CMR', flag: 'cmr' }
];

const FeatureFlagTool: React.FC<{}> = () => {
  const dispatch: Dispatch = useDispatch();
  const flags = useFlags();

  const handleCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    flag: keyof FlagSet
  ) => {
    dispatch(setMockFeatureFlags({ [flag]: e.target.checked }));
  };

  return (
    <div>
      {options.map(thisOption => {
        return (
          <label key={thisOption.flag}>
            {thisOption.label}{' '}
            <input
              type="checkbox"
              checked={Boolean(flags[thisOption.flag])}
              onChange={e => handleCheck(e, thisOption.flag)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default withFeatureFlagProvider(FeatureFlagTool);
