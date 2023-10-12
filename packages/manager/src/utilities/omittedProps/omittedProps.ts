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
