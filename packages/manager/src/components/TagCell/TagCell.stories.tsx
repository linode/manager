import { storiesOf } from '@storybook/react';
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
  'tagggg'
];

const TagTableCellStory: React.FC<{}> = _ => {
  const [_tags, setTags] = React.useState<string[]>(tags);
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);

  const deleteTag = (thisTag: string) => {
    setTags((currentTags: string[]) => {
      return currentTags.filter(currentTag => currentTag !== thisTag);
    });
  };

  const addTag = (newTag: string) => {
    setTags([..._tags, newTag]);
  };

  return (
    <>
      <TagCell
        tags={_tags}
        addTag={addTag}
        deleteTag={deleteTag}
        listAllTags={() => setDrawerOpen(true)}
        width={500}
      />
      <TagDrawer
        entityLabel="MyLinode"
        open={drawerOpen}
        tags={_tags}
        deleteTag={deleteTag}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

storiesOf('TagCell', module).add('small number of tags', () => (
  <div style={{ width: '500px', margin: 'auto' }}>
    <Table>
      <TableHead title="Tag cell story">
        <TableRow>
          <TableCell>Tags</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TagTableCellStory />
        </TableRow>
      </TableBody>
    </Table>
  </div>
));
