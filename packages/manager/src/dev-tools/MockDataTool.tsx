import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Item } from 'src/components/EnhancedSelect/Select';
import withFeatureFlagProvider from 'src/containers/withFeatureFlagProvider.container';
import { Dispatch } from 'src/hooks/types';
import { useSet } from 'src/hooks/useSet';
import {
  addMockData,
  MockDataOption,
  removeMockData
} from 'src/store/mockData';

const options: Item<MockDataOption>[] = [{ label: 'Linodes', value: 'linode' }];

const MockDataTool: React.FC<{}> = () => {
  const dispatch: Dispatch = useDispatch();
  const [values, setValues] = React.useState<Record<MockDataOption, number>>({
    linode: 1
  });
  const checked = useSet();

  const handleInputChange = (key: MockDataOption, value: number) => {
    setValues(prevValues => ({
      ...prevValues,
      [key]: value
    }));
    dispatch(addMockData({ key, value }));
  };

  return (
    <div>
      {options.map(thisOption => {
        return (
          <div key={thisOption.value} style={{ marginTop: 4 }}>
            <label>
              Mock {thisOption.label}
              <input
                type="checkbox"
                checked={checked.has(thisOption.value)}
                onChange={e => {
                  if (e.target.checked) {
                    checked.add(thisOption.value);
                    dispatch(
                      addMockData({
                        key: thisOption.value,
                        value: values[thisOption.value]
                      })
                    );
                  } else {
                    checked.delete(thisOption.value);
                    dispatch(removeMockData(thisOption.value));
                  }
                }}
              />
            </label>
            <input
              style={{ marginLeft: 4 }}
              disabled={!checked.has(thisOption.value)}
              type="number"
              min="0"
              onChange={e =>
                handleInputChange(thisOption.value, Number(e.target.value))
              }
              value={values[thisOption.value]}
            />
          </div>
        );
      })}
    </div>
  );
};

export default withFeatureFlagProvider(MockDataTool);
