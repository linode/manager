import * as Bluebird from 'bluebird';

import { enableBackups } from 'src/services/linodes';

export const enableAllBackups = (linodes: Linode.Linode[]) =>
  Bluebird.map(linodes, (linode: Linode.Linode) =>
    enableBackups(linode.id)
  );