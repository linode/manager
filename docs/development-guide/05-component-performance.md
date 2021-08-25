# Component Performance

When composing React components, follow community best practices for component performance. A few guidelines:

- In general, be aware of the "work" that your component is doing on each render (e.g. mapping through arrays) and take care not to do more than necessary.
- Use flat props (instead of objects) where it is feasible to do so, and use memoization (with React.memo).

```tsx
// Accepting an entire Linode as a prop:
interface Props {
  linode: Linode;
}

const LinodeLabelDisplay: React.FC<Props> = (props) => {
  return <span>{props.linode.label}</span>;
};

// Better version, using flat props.
// This allows for better quality checking by React,
// and thus gives you the ability to use memoization:
interface Props {
  label: string;
}

const LinodeLabelDisplay: React.FC<Props> = (props) => {
  return <span>{props.label}</span>;
};

export default React.memo(LinodeLabelDisplay);
```

- There are a few heuristics for whether or not your component should use `React.memo` ([source](https://dmitripavlutin.com/use-react-memo-wisely/)):
  - **Pure functional component**
    - Your component is functional and given the same props, always renders the same output
  - **Renders often**
    - Your component renders often
  - **Re-renders with the same props**
    - Your component is usually provided with the same props during re-rendering.
  - **Medium to big size**
    - Your component contains a decent amount of UI elements.
- Use the React Dev Tools Profiler to assess component tree performance.
- Use `React.useCallback` and `React.useMemo` in the body of your component where appropriate.
