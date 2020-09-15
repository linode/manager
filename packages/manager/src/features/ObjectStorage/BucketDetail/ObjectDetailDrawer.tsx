import * as React from 'react';

// import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Typography from 'src/components/core/Typography';
import { readableBytes } from 'src/utilities/unitConversions';
import ExternalLink from 'src/components/ExternalLink';
import { truncateMiddle } from 'src/utilities/truncate';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }));

interface Props {
  open: boolean;
  onClose: () => void;
  name?: string;
  size?: number | null;
  lastModified?: string | null;
  // enablePublicURL: () => void;
  url?: string;
}

const ObjectDetailDrawer: React.FC<Props> = props => {
  const { open, onClose, name, size, lastModified, url } = props;

  // const classes = useStyles();

  return (
    <Drawer open={open} onClose={onClose} title={name ?? 'Object Detail'}>
      {size && <Typography>{readableBytes(size).formatted}</Typography>}
      {lastModified && <Typography>Last modified: {lastModified}</Typography>}
      {/* ENABLE PUBLIC URL TOGGLE */}
      {url && <ExternalLink link={url} text={truncateMiddle(url)} />}
      {/* COPY TO CLIPBOARD */}
      {/* OPEN */}
    </Drawer>
  );
};

export default ObjectDetailDrawer;
