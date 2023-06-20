import * as React from 'react';
import { Tag, TagProps } from 'src/components/Tag/Tag';

interface Props extends TagProps {
  tagLabel: string;
  loading: boolean;
  onDelete?: (tag: string) => void;
}

type CombinedProps = Props;

/*
 * Abstraction of the Tag component for the purposes of passing the
 * delete payload to the onDelete function
 */
class TagsPanelItem extends React.Component<CombinedProps, {}> {
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

  render() {
    const { onDelete, ...restOfProps } = this.props;
    return (
      <Tag
        {...(restOfProps as any)}
        onDelete={onDelete ? this.handleDelete : undefined}
        component={'button' as 'div'}
        colorVariant="lightBlue"
      />
    );
  }
}

export default TagsPanelItem;
