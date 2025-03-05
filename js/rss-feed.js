/*
 * This function asynchronously reads an RSS feed, extracts the specified number of items,
 * truncates the description/content of each item to a given number of characters, and
 * then makes the processed data available for further use (e.g., displaying on a webpage).
 *
 * @async
 * @function fetchAndProcessRSS
 * @param {string} rssFilePath - The file path to the RSS feed (e.g., 'rss/news.xml', or an absolute URL).
 * @param {number} numItemsToDisplay - The number of RSS items to extract and process.
 * @param {number} numOfCharacters - The maximum number of characters to include in the truncated description/content of each item.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of processed RSS item objects.
 * Each object contains the title, description, link, and other relevant data.
 * The description is truncated to the specified `numOfCharacters`.
 * @throws {Error} Throws an error if there's an issue fetching or parsing the RSS feed.
 */
async function fetchAndProcessRSS(rssFilePath, numItemsToDisplay, numOfCharacters) {
  try {
    const response = await fetch(rssFilePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlString = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const items = Array.from(xmlDoc.querySelectorAll('item'));

    const filteredItems = items.filter(item => {
      const categories = item.querySelectorAll('category');
      return !Array.from(categories).some(category => {
        const categoryText = category.textContent;
        return categoryText.startsWith('Faculty') || categoryText.startsWith('Alumni')
          || categoryText.startsWith('Funding') || categoryText.startsWith('Awards');
      });
    });

    const processedItems = filteredItems.slice(0, numItemsToDisplay).map(item => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;

      // get item image
      let imageElement = null;
      const mediaContentElements = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content');
      for (const mediaContent of mediaContentElements) {
        const medium = mediaContent.getAttribute('medium');
        if (medium === 'image' || medium === null) {
          imageElement = mediaContent;
          break;
        }
      }
      if (imageElement) {
        image = imageElement.getAttribute('url');
      }

      // Content
      let content = null;
      const contentEncodedElements = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded');

      // reduce the amount of content
      if (contentEncodedElements.length > 0) {
        const contentEncoded = contentEncodedElements[0].textContent;
        content = getCertainNumberOfCharacters(contentEncoded, numOfCharacters);
      }

      return {
        title,
        link,
        description,
        image,
        content,
      };
    });

    return processedItems; // Return the array of processed items

  } catch (error) {
    console.error("Error fetching or processing RSS:", error);
    return null;
  }
}

function getCertainNumberOfCharacters(text, numOfCharacters) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const plainText = tempDiv.textContent || tempDiv.innerText || ""; // Get plain text.
    const words = plainText.trim().split(/\s+/);
    return words.slice(0, numOfCharacters).join(' ') + (words.length > numOfCharacters ? '...' : '');
}