import type { SelectOption } from '@linode/ui';

export const tagsToItems = (tags: string[]): SelectOption<string>[] =>
  tags.reduce((accum: SelectOption<string>[], thisTag: string) => {
    return [...accum, { label: thisTag, value: thisTag }];
  }, []);

export const getTagsAsStrings = (
  tagItems: SelectOption<string>[]
): string[] => {
  return tagItems.map((thisTag) => thisTag.label);
};
