---
parent: Development Guide
---

# Performance

When composing React components, follow community best practices for performance. A few guidelines:

- In general, be aware of the "work" that your component is doing on each render (e.g. mapping through arrays) and take care not to do more than necessary.
- Use flat props (instead of objects) where it is feasible to do so:

```tsx
// Accepting an entire Linode object as a prop:
interface Props {
  linode: Linode;
}

const LinodeLabelDisplay = (props: Props) => {
  return <span>{props.linode.label}</span>;
};

// "Flattening" the props and giving the component only what it cares about:
interface Props {
  label: string;
}

const LinodeLabelDisplay = (props: Props) => {
  return <span>{props.label}</span>;
};

export default React.memo(LinodeLabelDisplay);
```

- If the component should render the same result given the same props, considering wrapping the component in [React.memo](https://reactjs.org/docs/react-api.html#reactmemo) to optimize performance.
- Use the React Dev Tools Profiler to assess component tree performance.
- Use [React.useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback) and [React.useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) in the body of your component where appropriate.
