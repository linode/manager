import { sendEvent } from 'src/utilities/analytics';

/**
 * sends off an analytics event with how many entities came back from a search request
 * for the purposes of determining how many entities does an average user have.
 *
 * @param { number } howManyThingsRequested - how many entities came back in our
 * network request to get all the things
 */
export default (howManyThingsRequested: number) => {
  /**
   * We are splitting analytics tracking into a few different buckets
   */
  let bucketText = '';
  if (howManyThingsRequested > 500) {
    bucketText = '500+'
  } else if (howManyThingsRequested > 100) {
    bucketText = '100-499'
  } else if (howManyThingsRequested > 25) {
    bucketText = '26-100'
  } else if (howManyThingsRequested > 10) {
    bucketText = '11-26'
  } else {
    bucketText = '0-10'
  }

  /**
   * send an event with the number of requested entities
   * and the URL pathname and query string
   */
  sendEvent({
    category: 'Search',
    action: 'Data fetch all entities',
    label: bucketText,
    value: howManyThingsRequested
  });
}
