import { splitAt } from 'ramda';
import * as React from 'react';
import ShowMore from 'src/components/ShowMore';
import { Tag } from 'src/components/Tag/Tag';

export interface TagsProps {
  tags: string[];
}

const Tags = (props: TagsProps) => {
  const { tags } = props;

  const renderTags = (tags: string[]) => {
    return tags.map((eachTag) => {
      return (
        <Tag
          label={eachTag}
          key={eachTag}
          component={'button' as 'div'}
          colorVariant="lightBlue"
        />
      );
    });
  };

  const renderMoreTags = (tags: string[]) => {
    return <ShowMore items={tags} render={renderTags} ariaItemType="tags" />;
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

export { Tags };
