import { splitAt } from '@linode/utilities';
import * as React from 'react';

import { ShowMore } from 'src/components/ShowMore/ShowMore';
import { Tag } from 'src/components/Tag/Tag';

export interface TagsProps {
  /**
   * An array of tags to be displayed.
   */
  tags: string[];
}

export const Tags = (props: TagsProps) => {
  const { tags } = props;

  const renderTags = (tags: string[]) => {
    return tags.map((eachTag) => {
      return (
        <Tag
          colorVariant="lightBlue"
          component={'button' as 'div'}
          key={eachTag}
          label={eachTag}
        />
      );
    });
  };

  const renderMoreTags = (tags: string[]) => {
    return <ShowMore ariaItemType="tags" items={tags} render={renderTags} />;
  };

  if (!tags) {
    return null;
  }

  const [visibleTags, additionalTags] = splitAt(3, tags);
  return (
    <>
      {renderTags(visibleTags)}
      {!!additionalTags.length && renderMoreTags(additionalTags)}
    </>
  );
};
