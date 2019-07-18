import * as React from 'react';

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import DrawerContent from 'src/components/DrawerContent';

import { Converter } from 'showdown';
import 'showdown-highlightjs-extension';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      wordWrap: 'break-word',
      overflowX: 'hidden'
    }
  });

interface Props {
  kubeConfig: string;
  open: boolean;
  closeDrawer: () => void;
}

export type CombinedProps = Props & WithStyles<ClassNames>;

const splitCode = (code: string): string => {
  const MAX_LENGTH = 65;
  const lines = code.split('\n');
  const shortLines = lines.map(thisLine =>
    thisLine.length > MAX_LENGTH
      ? splitCode(
          thisLine.slice(0, MAX_LENGTH) + '\n' + thisLine.slice(MAX_LENGTH)
        )
      : thisLine
  );
  return shortLines.join('\n');
};

export const KubeConfigDrawer: React.FC<CombinedProps> = props => {
  const { classes, kubeConfig, closeDrawer, open } = props;
  const title = 'blah';
  const error = false;
  const loading = false;

  const html = new Converter({
    extensions: ['highlightjs'],
    simplifiedAutoLink: true,
    openLinksInNewWindow: true
  }).makeHtml(splitCode('```\n' + kubeConfig + '\n```'));
  return (
    <Drawer title={'View Kubeconfig'} open={open} onClose={closeDrawer} chubby>
      <DrawerContent title={title} error={error} loading={loading}>
        {/* <ScriptCode script={script} /> */}
        <pre
          className={classes.root}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
        />
      </DrawerContent>
    </Drawer>
  );
};

const styled = withStyles(styles);
export default styled(KubeConfigDrawer);
