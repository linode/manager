import { getDomain } from 'linode-js-sdk/lib/domains';
import { deleteDomain, upsertDomain } from 'src/store/domains/domains.actions';
import { EventHandler } from 'src/store/types';

const handler: EventHandler = (event, dispatch) => {
  const { action } = event;
  if (action === 'domain_create') {
    const { id } = event.entity;
    return getDomain(id).then(domain => {
      dispatch(upsertDomain(domain));
    });
  }

  if (action === 'domain_delete') {
    const { id } = event.entity;
    return dispatch(deleteDomain(id));
  }

  return;
};

export default handler;
