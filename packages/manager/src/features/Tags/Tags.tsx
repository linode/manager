import { CircleProgress } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { useAllTagsQuery } from 'src/queries/tags';

const Tags = () => {
  const history = useHistory();
  const { data: tags, error, isPending } = useAllTagsQuery();

  if (isPending) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <>
      <LandingHeader createButtonText="Create Tag" onButtonClick={() => null} />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tag</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.label}>
              <TableCell>
                <Link to={`/tags/${tag.label}`}>{tag.label}</Link>
              </TableCell>
              <TableCell actionCell>
                <InlineMenuAction
                  actionText="View in Search"
                  onClick={() => history.push(`/search?query=${tag.label}`)}
                />
                <InlineMenuAction actionText="Delete" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export const tagsLandingLazyRoute = createLazyRoute('/')({
  component: Tags,
});
