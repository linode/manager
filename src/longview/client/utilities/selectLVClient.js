import { selectObjectByLabel } from '~/api/util';

export const selectLVClient = selectObjectByLabel({
  collection: 'lvclients',
  paramField: 'lvLabel',
  resultField: 'lvclient',
});
