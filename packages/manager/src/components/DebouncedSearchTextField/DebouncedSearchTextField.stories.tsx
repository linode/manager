import { action } from '@storybook/addon-actions';
import * as React from 'react';

import { DebouncedSearchTextField } from './DebouncedSearchTextField';

import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof DebouncedSearchTextField>;

const SEARCH_FOR_SOMETHING = 'Search for something';

const exampleList = [
  'apples',
  'oranges',
  'grapes',
  'walruses',
  'keyboards',
  'chairs',
  'speakers',
  'ecumenical council number two',
];

export const Default: Story = {
  args: {
    debounceTime: 400,
    hideLabel: true,
    isSearching: true,
    label: SEARCH_FOR_SOMETHING,
    onSearch: action('searching'),
    placeholder: SEARCH_FOR_SOMETHING,
    value: 'searching',
  },
  render: (args) => <DebouncedSearchTextField {...args} />,
};

export const LiveSearchExample: Story = {
  render: () => {
    const SearchTextFieldWrapper = () => {
      const [list, setList] = React.useState([...exampleList]);
      const [isSearching, setIsSearching] = React.useState(false);

      const handleSearch = async (value: string) => {
        setIsSearching(true);
        action('searching')(value);
        const res: string[] = await new Promise((resolve) => {
          setTimeout(() => {
            if (!value.trim()) {
              return resolve(exampleList);
            }
            const filteredList = list.filter((eachVal: string) =>
              eachVal.includes(value.toLowerCase())
            );
            return resolve(filteredList);
          }, 800);
        });
        action('result')(res);
        setIsSearching(false);
        setList(res);
      };

      return (
        <>
          <DebouncedSearchTextField
            debounceTime={250}
            hideLabel
            isSearching={isSearching}
            label={SEARCH_FOR_SOMETHING}
            onSearch={handleSearch}
            placeholder={SEARCH_FOR_SOMETHING}
            value=""
          />
          <ul data-qa-list>
            {list.map((eachThing: string) => {
              return (
                <li data-qa-list-item key={eachThing}>
                  {eachThing}
                </li>
              );
            })}
          </ul>
        </>
      );
    };

    return <SearchTextFieldWrapper />;
  },
};

const meta: Meta<typeof DebouncedSearchTextField> = {
  component: DebouncedSearchTextField,
  title: 'Components/Search',
};

export default meta;
