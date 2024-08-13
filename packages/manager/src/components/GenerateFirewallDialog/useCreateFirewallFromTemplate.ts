import { useQueryClient } from '@tanstack/react-query';

import { useCreateFirewall } from 'src/queries/firewalls';
import { firewallQueries } from 'src/queries/firewalls';

import type { DialogState } from './GenerateFirewallDialog';
import type {
  CreateFirewallPayload,
  Firewall,
  FirewallTemplate,
} from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

export const useCreateFirewallFromTemplate = (options: {
  onFirewallGenerated?: (firewall: Firewall) => void;
  setDialogState: (state: DialogState) => void;
}) => {
  const { onFirewallGenerated, setDialogState } = options;
  const queryClient = useQueryClient();
  const { mutateAsync: createFirewall } = useCreateFirewall();

  return () =>
    createFirewallFromTemplate({
      createFirewall,
      queryClient,
      updateProgress: (progress: number) =>
        setDialogState({ progress, step: 'progress' }),
    })
      .then((firewall) => {
        onFirewallGenerated?.(firewall);
        setDialogState({
          firewall,
          step: 'success',
        });
      })
      .catch((error) =>
        setDialogState({
          error: error?.[0]?.reason ?? error,
          step: 'error',
        })
      );
};

const createFirewallFromTemplate = async (handlers: {
  createFirewall: (firewall: CreateFirewallPayload) => Promise<Firewall>;
  queryClient: QueryClient;
  updateProgress: (progress: number | undefined) => void;
}): Promise<Firewall> => {
  const { createFirewall, queryClient, updateProgress } = handlers;
  updateProgress(0);

  // Get firewalls and firewall template in parallel
  const [template, firewalls] = await Promise.all([
    getFirewallTemplate(queryClient),
    queryClient.fetchQuery(firewallQueries.firewalls._ctx.all),
  ]);
  updateProgress(50); // this gives the appearance of linear progress

  // Determine new firewall name
  const label = await getUniqueFirewallLabel(template, firewalls);
  updateProgress(80);

  // Create new firewall
  return await createFirewall({ label, rules: template.rules });
};

const getFirewallTemplate = async (queryClient: QueryClient) => {
  const templates = await queryClient.fetchQuery(firewallQueries.templates);
  if (templates.length < 1) {
    throw Error('No firewall templates are available.');
  }
  return templates[0];
};

const getUniqueFirewallLabel = async (
  template: FirewallTemplate,
  firewalls: Firewall[]
) => {
  let iterator = 1;
  const firewallLabelExists = (firewall: Firewall) =>
    firewall.label === firewallLabelFromSlug(template.slug, iterator);
  while (firewalls.some(firewallLabelExists)) {
    iterator++;
  }

  return firewallLabelFromSlug(template.slug, iterator);
};

// Firewalls labels are constrained to 32 characters
const firewallLabelFromSlug = (slug: string, iterator: number) => {
  const iteratorSuffix = `-${iterator}`;
  return slug.substring(0, 32 - iteratorSuffix.length) + iteratorSuffix;
};
