import * as React from 'react';

import { Tag, TagProps } from 'src/components/Tag/Tag';

interface Props extends TagProps {
  loading: boolean;
  onDelete?: (tag: string) => void;
  tagLabel: string;
}

type CombinedProps = Props;

/*
 * Abstraction of the Tag component for the purposes of passing the
 * delete payload to the onDelete function
 */
class TagsPanelItem extends React.Component<CombinedProps, {}> {
  render() {
    const { onDelete, ...restOfProps } = this.props;
    return (
      <Tag
        {...(restOfProps as any)}
        colorVariant="lightBlue"
        component={'button' as 'div'}
        onDelete={onDelete ? this.handleDelete : undefined}
      />
    );
  }

  handleDelete = () => {
    const { onDelete } = this.props;
    /*
     * checking loading prop to prevent user from clicking the button repeatedly
     */
    if (!onDelete || this.props.loading) {
      return;
    }
    onDelete(this.props.tagLabel);
  };
}

export default TagsPanelItem;
