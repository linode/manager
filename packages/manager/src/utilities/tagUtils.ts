import { Item } from 'src/components/EnhancedSelect/Select';

export const tagsToItems = (tags: string[]): Item<string>[] =>
  tags.reduce((accum: Item<string>[], thisTag: string) => {
    return [...accum, { label: thisTag, value: thisTag }];
  }, []);

export const getTagsAsStrings = (tagItems: Item<string>[]): string[] => {
  return tagItems.map((thisTag) => thisTag.label);
};
