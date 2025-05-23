// import {
//   useMutatePreferences,
//   usePreferences,
// } from 'src/queries/profile/preferences';

// /**
//  * useGroupingTags is a hook that allows you to handle grouping tables by tags.
//  */
// export const useGroupingTags = () => {
//   const { data: groupedByTags } = usePreferences((preferences) => {
//     return preferences?.volumes_group_by_tag;
//   });
//   const { mutateAsync: updatePreferences } = useMutatePreferences();

//   const handleGroupingByTagsChange = (newGroupByTags: boolean) => {
//     updatePreferences({
//       volumes_group_by_tag: newGroupByTags,
//     });
//   };

//   return { handleGroupingByTagsChange, groupedByTags: !!groupedByTags };
// };
