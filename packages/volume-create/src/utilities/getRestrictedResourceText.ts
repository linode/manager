import { grantTypeMap } from "./grantTypeMap";

export const PARENT_USER = 'parent user';
export const ADMINISTRATOR = 'account administrator';

/**
 * Get a resource restricted message based on action and resource type.
 */
export const getRestrictedResourceText = ({
  action = "edit",
  includeContactInfo = true,
  isChildUser = false,
  isSingular = true,
  resourceType,
}: GetRestrictedResourceText): string => {
  const resource = isSingular
    ? "this " + resourceType.replace(/s$/, "")
    : resourceType;

  const contactPerson = isChildUser ? PARENT_USER : ADMINISTRATOR;

  let message = `You don't have permissions to ${action} ${resource}.`;

  if (includeContactInfo) {
    message += ` Please contact your ${contactPerson} to request the necessary permissions.`;
  }

  return message;
};

type ActionType =
  | "attach"
  | "clone"
  | "create"
  | "delete"
  | "detach"
  | "edit"
  | "migrate"
  | "modify"
  | "reboot"
  | "rebuild"
  | "rescue"
  | "resize"
  | "view";

interface GetRestrictedResourceText {
  action?: ActionType;
  includeContactInfo?: boolean;
  isChildUser?: boolean;
  isSingular?: boolean;
  resourceType: typeof grantTypeMap[keyof typeof grantTypeMap];
}
