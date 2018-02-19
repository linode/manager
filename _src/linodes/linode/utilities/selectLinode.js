import { selectObjectByLabel } from '~/api/util';

export const selectLinode = selectObjectByLabel({
  collection: 'linodes',
  paramField: 'linodeLabel',
  resultField: 'linode',
});
