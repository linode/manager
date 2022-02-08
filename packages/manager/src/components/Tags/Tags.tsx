import { splitAt } from 'ramda';
import * as React from 'react';
import ShowMore from 'src/components/ShowMore';
import Tag from 'src/components/Tag';

export interface Props {
  tags: string[];
}

type CombinedProps = Props;

export const Tags: React.FC<CombinedProps> = (props) => {
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

export default Tags;
