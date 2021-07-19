import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TagCell from './TagCell';
import TagDrawer from './TagDrawer';

const tags = [
  'tag1',
  'tag2',
  'tag2.5',
  'tag3',
  'tagtagtagtagtagtag',
  'tag4',
  'tagggg',
];

const TagTableCellStory: React.FC<{ tags: string[] }> = (props) => {
  const [_tags, setTags] = React.useState<string[]>(props.tags);
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);

  const deleteTag = (thisTag: string) => {
    setTags((currentTags: string[]) => {
      return currentTags.filter((currentTag) => currentTag !== thisTag);
    });
    return Promise.resolve();
  };

  const addTag = (newTag: string) => {
    setTags([..._tags, newTag]);
    return Promise.resolve();
  };

  return (
    <div style={{ width: '500px', margin: 'auto' }}>
      <Table>
        <TableHead title="Tag cell story">
          <TableRow>
            <TableCell>Tags</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TagCell
              tags={_tags}
              addTag={addTag}
              deleteTag={deleteTag}
              listAllTags={() => setDrawerOpen(true)}
              width={500}
            />
          </TableRow>
        </TableBody>
      </Table>
      <TagDrawer
        entityLabel="MyLinode"
        open={drawerOpen}
        tags={_tags}
        addTag={addTag}
        deleteTag={deleteTag}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default {
  title: 'UI Elements/Tag Cell',
};

export const LargeNumberOfTagsOverflowState = () => (
  <TagTableCellStory tags={tags} />
);

LargeNumberOfTagsOverflowState.story = {
  name: 'Large number of tags (overflow state)',
};

export const FewerTags = () => <TagTableCellStory tags={tags.slice(0, 2)} />;

FewerTags.story = {
  name: 'Fewer tags',
};
