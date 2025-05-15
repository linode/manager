/**
 * Interface to define the shape of Cloud Manager's APIError type.
 * This is an identical version of the type defined in api-v4, which we redeclare here to avoid a dependency on api-v4 in ui.
 */
export interface APIError {
  field?: string;
  reason: string;
}

export const getErrorText = (
  error: APIError[] | null | string | undefined,
): null | string | undefined => {
  if (Array.isArray(error)) {
    return error[0]?.reason;
  }

  return error;
};
