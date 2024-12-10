/**
 * Helper to filter out props that are not valid for a component to avoid
 * passing them down to the DOM. This is to avoid the verbose API presented by
 * MUI and Emotion and to provide type safety.
 * @param props Array of props to filter out
 * @returns Boolean indicating whether the prop should be omitted
 * @see https://mui.com/material-ui/customization/how-to-customize/#dynamic-overrides
 * @Usage
 *    const MyComponent = styled(Button, {
 *      shouldForwardProp: omittedProps(['compactX', 'compactY']),
 *    })<Props>(({ theme, ...props }) => ({ ... }));
 */
export const omittedProps = <Props>(props: Array<keyof Props>) => (
  prop: keyof Props
): boolean => !props.includes(prop);

/**
   * Helper to filter out props we spread into a component.
   * This helpers differs from `omittedProps` in that it omits the props
   * from the object instead of returning a boolean.
   * This util is a direct replacement for `omit` from lodash.

 * @param props Array of props to filter out
 * @param toRemove Array of props to remove
 * @returns Object with props removed
 */
export const omitProps = <
  Props extends NonNullable<unknown>,
  Keys extends keyof Props & string
>(
  props: Props,
  toRemove: Keys[] & string[]
) =>
  Object.fromEntries(
    Object.entries(props).filter(([key]) => !toRemove.includes(key))
  ) as Omit<Props, Keys>;
