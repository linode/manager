import { useQueryClient } from '@tanstack/react-query';

import { firewallQueries } from 'src/queries/firewalls';
import { useCreateFirewall } from 'src/queries/firewalls';

import type { DialogState } from './GenerateFirewallDialog';
import type {
  CreateFirewallPayload,
  Firewall,
  FirewallTemplateSlug,
} from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

export const useCreateFirewallFromTemplate = (options: {
  onFirewallGenerated?: (firewall: Firewall) => void;
  setDialogState: (state: DialogState) => void;
  templateSlug: FirewallTemplateSlug;
}) => {
  const { onFirewallGenerated, setDialogState, templateSlug } = options;
  const queryClient = useQueryClient();
  const { mutateAsync: createFirewall } = useCreateFirewall();

  return {
    createFirewallFromTemplate: () =>
      createFirewallFromTemplate({
        createFirewall,
        queryClient,
        templateSlug,
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
        ),
  };
};

export const createFirewallFromTemplate = async (options: {
  createFirewall: (firewall: CreateFirewallPayload) => Promise<Firewall>;
  queryClient: QueryClient;
  templateSlug: FirewallTemplateSlug;
  updateProgress?: (progress: number | undefined) => void;
}): Promise<Firewall> => {
  const { createFirewall, queryClient, templateSlug, updateProgress } = options;
  if (updateProgress) {
    updateProgress(0);
  }
  await new Promise((resolve) => setTimeout(resolve, 0)); // return control to the DOM to update the progress

  // Get firewalls and firewall template in parallel
  const [{ rules, slug }, firewalls] = await Promise.all([
    queryClient.ensureQueryData(firewallQueries.template(templateSlug)),
    queryClient.fetchQuery(firewallQueries.firewalls._ctx.all), // must fetch fresh data if generating more than one firewall
  ]);

  if (updateProgress) {
    updateProgress(80); // this gives the appearance of linear progress
  }
  // Determine new firewall name
  const label = getUniqueFirewallLabel(slug, firewalls);

  // Create new firewall
  return await createFirewall({ label, rules });
};

const getUniqueFirewallLabel = (
  templateSlug: FirewallTemplateSlug,
  firewalls: Firewall[]
) => {
  let iterator = 1;
  const firewallLabelExists = (firewall: Firewall) =>
    firewall.label === firewallLabelFromSlug(templateSlug, iterator);
  while (firewalls.some(firewallLabelExists)) {
    iterator++;
  }

  return firewallLabelFromSlug(templateSlug, iterator);
};

const firewallLabelFromSlug = (
  slug: FirewallTemplateSlug,
  iterator: number
) => {
  const MAX_LABEL_LENGTH = 32;
  const iteratorSuffix = `-${iterator}`;
  return (
    slug.substring(0, MAX_LABEL_LENGTH - iteratorSuffix.length) + iteratorSuffix
  );
};
