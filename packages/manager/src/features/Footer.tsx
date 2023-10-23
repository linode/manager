import Stack from '@mui/material/Stack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
} from 'src/components/SideMenu';
import { DEVELOPERS_LINK, FEEDBACK_LINK } from 'src/constants';

import packageJson from '../../package.json';

interface Props {
  desktopMenuIsOpen: boolean;
}

export const Footer = React.memo((props: Props) => {
  const { desktopMenuIsOpen } = props;

  return (
    <footer role="contentinfo">
      <Stack
        sx={(theme) => ({
          backgroundColor: theme.bg.main,
          paddingLeft: {
            md: desktopMenuIsOpen
              ? `${SIDEBAR_COLLAPSED_WIDTH + 16}px`
              : `${SIDEBAR_WIDTH + 16}px`,
            sm: 2,
            xs: 2,
          },
          paddingY: theme.spacing(2.5),
          transition: 'padding-left .1s linear', // match the sidebar transition speed
        })}
        direction={{ sm: 'row', xs: 'column' }}
        spacing={{ sm: 4, xs: 1 }}
      >
        <Link
          forceCopyColor
          to={`https://github.com/linode/manager/releases/tag/linode-manager@v${packageJson.version}`}
        >
          v{packageJson.version}
        </Link>
        <Link forceCopyColor to={DEVELOPERS_LINK}>
          API Reference
        </Link>
        <Link forceCopyColor to={FEEDBACK_LINK}>
          Provide Feedback
        </Link>
      </Stack>
    </footer>
  );
});
