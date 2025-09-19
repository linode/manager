import { useLinodeQuery } from '@linode/queries';

type AclpStage = 'beta' | 'ga';

/**
 * Determines if the linode is subscribed to ACLP or legacy alerts.
 *
 * ### Cases:
 * - Legacy alerts = 0, Beta alerts = []
 *   - Show default Legacy UI (disabled) for Beta stage
 *   - Show default Beta UI (disabled) for GA stage
 * - Legacy alerts > 0, Beta alerts = []
 *   - Show default Legacy UI (enabled)
 * - Legacy alerts = 0, Beta alerts has values (either system, user, or both)
 *   - Show default Beta UI (enabled)
 *
 * @param linodeId - The ID of the Linode
 * @param stage - The current ACLP stage: 'beta' or 'ga'
 * @returns {boolean} `true` if the Linode is subscribed to ACLP, otherwise `false`
 */
export const useIsLinodeAclpSubscribed = (
  linodeId: number | undefined,
  stage: AclpStage,
) => {
  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined,
  );

  if (!linode) {
    return false;
  }

  const hasLegacyAlerts =
    (linode.alerts.cpu ?? 0) > 0 ||
    (linode.alerts.io ?? 0) > 0 ||
    (linode.alerts.network_in ?? 0) > 0 ||
    (linode.alerts.network_out ?? 0) > 0 ||
    (linode.alerts.transfer_quota ?? 0) > 0;

  const hasAclpAlerts =
    (linode.alerts.system_alerts?.length ?? 0) > 0 ||
    (linode.alerts.user_alerts?.length ?? 0) > 0;

  // Always subscribed if ACLP alerts exist. For GA stage, default to subscribed if no alerts exist.
  return (
    hasAclpAlerts || (!hasAclpAlerts && !hasLegacyAlerts && stage === 'ga')
  );
};
