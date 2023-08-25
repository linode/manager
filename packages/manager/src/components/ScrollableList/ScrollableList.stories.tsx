import { Linode } from '@linode/api-v4';
import * as React from 'react';

import { Button } from '../Button/Button';
import { CheckedLinodeListItem } from './CustomListItems/CheckedLinodeListItem';
import { RemovableLinodeListItem } from './CustomListItems/RemovableLinodeListItem';
import { ScrollableList } from './ScrollableList';
import { ListItem } from 'src/components/ListItem';
import type { Meta, StoryObj } from '@storybook/react';

type Story = StoryObj<typeof ScrollableList>;

const listItems = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
].map((num) => {
  return { id: num, label: `my-linode-${num}` };
}) as Linode[];

/**
 * Default example of a scrollable list
 */
export const Default: Story = {
  args: {
    ListItems: listItems.map((item) => {
      return <ListItem key={item.id}>{item.label}</ListItem>;
    }),
  },
  render: (args) => {
    return <ScrollableList {...args} />;
  },
};

/**
 * Example of a scrollable list with checkable list items
 */
export const CheckedListItemsExample: Story = {
  render: () => {
    const ScrollableListWrapper = () => {
      const [checkedItems, setCheckedItems] = React.useState(new Set<number>());
      const handleCheck = (item: Linode) => {
        const newCheckedItems = new Set<number>([...Array.from(checkedItems)]);
        if (newCheckedItems.has(item.id)) {
          newCheckedItems.delete(item.id);
        } else {
          newCheckedItems.add(item.id);
        }
        setCheckedItems(newCheckedItems);
      };

      const checkedListItems = listItems.map((item) => {
        return (
          <CheckedLinodeListItem
            key={item.id}
            linode={item}
            onClickListItem={handleCheck}
            checked={checkedItems.has(item.id)}
          />
        );
      });

      return <ScrollableList ListItems={checkedListItems} />;
    };

    return <ScrollableListWrapper />;
  },
};

/**
 * Example of a scrollable list with removable list items
 */
export const RemovableListItemsExample: Story = {
  render: () => {
    const ScrollableListWrapper = () => {
      const [linodesInList, setLinodesInList] = React.useState(listItems);

      const handleRemove = (item: Linode) => {
        setLinodesInList(
          [...linodesInList].filter((linode) => linode.id !== item.id)
        );
      };

      const resetList = () => {
        setLinodesInList([...listItems]);
      };

      const removableListItems = linodesInList.map((item) => {
        return (
          <RemovableLinodeListItem
            key={item.id}
            linode={item}
            onClickListItem={handleRemove}
          />
        );
      });

      return (
        <>
          <ScrollableList ListItems={removableListItems} />
          <Button sx={{ marginTop: 2 }} onClick={resetList}>
            Reset list
          </Button>
        </>
      );
    };

    return <ScrollableListWrapper />;
  },
};

const meta: Meta<typeof ScrollableList> = {
  component: ScrollableList,
  title: 'Components/ScrollableList',
};

export default meta;
