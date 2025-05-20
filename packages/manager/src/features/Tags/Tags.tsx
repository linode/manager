import { useAllTagsQuery, useDeleteTagMutation } from '@linode/queries';
import { CircleProgress, Drawer, ErrorState } from '@linode/ui';
import { createLazyRoute, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';

import { CreateTagForm } from './CreateTagDrawer';

const Tags = () => {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const { data: tags, error, isPending } = useAllTagsQuery();
  const { mutate } = useDeleteTagMutation({
    onSuccess(data, tag) {
      enqueueSnackbar(`Successfully deleted tag "${tag}".`, {
        variant: 'success',
      });
    },
    onError(error) {
      enqueueSnackbar(`Unable to delete tag: ${error[0].reason}`, {
        variant: 'error',
      });
    },
  });

  if (isPending) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <>
      <LandingHeader
        createButtonText="Create Tag"
        onButtonClick={() => setIsCreateOpen(true)}
      />
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
                  onClick={() =>
                    navigate({
                      search: {
                        query: `tag:${tag.label}`,
                      },
                      to: '/search',
                    })
                  }
                />
                <InlineMenuAction
                  actionText="Delete"
                  onClick={() => mutate(tag.label)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Drawer
        onClose={() => setIsCreateOpen(false)}
        open={isCreateOpen}
        title="Create Tag"
      >
        <CreateTagForm onClose={() => setIsCreateOpen(false)} />
      </Drawer>
    </>
  );
};

export const tagsLandingLazyRoute = createLazyRoute('/')({
  component: Tags,
});
