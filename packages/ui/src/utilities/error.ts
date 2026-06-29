/**
 * Interface to define the shape of Cloud Manager's APIError type.
 * This is an identical version of the type defined in api-v4, which we redeclare here to avoid a dependency on api-v4 in ui.
 */
export interface APIError {
  field?: string;
  reason: string;
}
