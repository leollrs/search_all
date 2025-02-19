const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("Opening Grants.gov...");
  await page.goto('https://grants.gov/search-grants', { waitUntil: 'networkidle2' });

  // Search for "Puerto Rico"
  await page.waitForSelector('#inp-keywords', { timeout: 60000 });
  await page.evaluate(() => { document.querySelector('#inp-keywords').value = ''; });
  await page.type('#inp-keywords', 'Puerto Rico', { delay: 100 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Click the search button
  await page.waitForSelector('#btn-search', { timeout: 10000 });
  const searchButton = await page.$('#btn-search');
  if (searchButton) {
    await searchButton.click();
    console.log("Search button clicked. Waiting for results...");
  } else {
    console.error("Search button not found!");
    await browser.close();
    return;
  }

  try {
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
  } catch (error) {
    console.warn("Page took too long to load, continuing anyway...");
  }

  console.log("Search submitted. Extracting total pages...");

  // Find the last page number
  let lastPageNumber = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('a.usa-pagination__button'));
    let maxTotal = 1;
    buttons.forEach(btn => {
      const title = btn.getAttribute('title');
      if (title) {
        const match = title.match(/Page\s+\d+\s+of\s+(\d+)/i);
        if (match && match[1]) {
          const total = parseInt(match[1]);
          if (total > maxTotal) {
            maxTotal = total;
          }
        }
      }
    });
    return maxTotal;
  });

  console.log(`Total pages detected: ${lastPageNumber}`);

  let allGrants = [];
  let currentPage = 1;

  while (true) {
    console.log(`Scraping page ${currentPage}...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Extract grant data
    const grants = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tbody tr')).map(row => {
        const titleElement = row.querySelector('td:nth-child(2)');
        const linkElement = row.querySelector('td:nth-child(1) a');
        const agencyElement = row.querySelector('td:nth-child(3)'); // Adjust if funding is in a different column
        const deadlineElement = row.querySelector('td:nth-child(6)'); // Adjust for deadline info

        if (titleElement && linkElement) {
          return {
            title: titleElement.innerText.trim(),
            link: linkElement.href.startsWith('http')
              ? linkElement.href
              : 'https://grants.gov' + linkElement.getAttribute('href'),
            agency: agencyElement ? agencyElement.innerText.trim() : "N/A",
            deadline: deadlineElement ? deadlineElement.innerText.trim() : "N/A"
          };
        }
        return null;
      }).filter(grant => grant !== null);
    });

    allGrants.push(...grants);
    console.log(`Extracted ${grants.length} grants from page ${currentPage}`);

    if (currentPage >= lastPageNumber) {
      console.log("Reached last page. Stopping...");
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Find the next page button
    const nextPageSelector = `a.usa-pagination__button[title*="Page ${currentPage + 1} of"]`;
    const nextPageButton = await page.$(nextPageSelector);
    if (!nextPageButton) {
      console.log("Next page button not found. Stopping...");
      break;
    }

    console.log(`Going to page ${currentPage + 1}...`);
    await nextPageButton.click();
    await new Promise(resolve => setTimeout(resolve, 5000));
    currentPage++;
  }

  // Save grants data as JSON
  const jsonFilePath = path.join(__dirname, 'grants_data.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(allGrants, null, 2), 'utf-8');

  console.log(`✅ Data saved to ${jsonFilePath}`);
  await browser.close();
})();
