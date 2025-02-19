const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("Opening licitaciones.dde.pr...");
  await page.goto('https://licitaciones.dde.pr/', { waitUntil: 'networkidle2' });

  // Wait for the grid header elements to load.
  await page.waitForSelector('span.k-column-title', { timeout: 60000 });

  let allEntries = [];
  const maxPages = 5;
  let currentPage = 1;

  // Custom sleep function to allow page content to load.
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  while (currentPage <= maxPages) {
    console.log(`Scraping page ${currentPage}...`);
    await sleep(3000); // Wait for page content to load

    // Extract data from each row of the table.
    // Expected columns:
    // 0: Numeración de Solicitud
    // 1: Tipo de Solicitud
    // 2: Título
    // 3: Fecha de Publicación
    // 4: Solicitante
    // 5: Estado
    let entries = await page.evaluate(() => {
      // Attempt to select rows from a table; fallback to Kendo grid container.
      let rows = Array.from(document.querySelectorAll('table tbody tr'));
      if (rows.length === 0) {
        rows = Array.from(document.querySelectorAll('.k-grid-content tr'));
      }
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        // Ensure there are at least 6 cells.
        if (cells.length < 6) return null;
        return {
          "Tipo de Solicitud": cells[2].innerText.trim(),
          "Título": cells[3].innerText.trim(),
          "Fecha de Publicación": cells[4].innerText.trim(),
          "Estado": cells[6].innerText.trim()
        };
      }).filter(item => item !== null);
    });

    console.log(`Found ${entries.length} entries on page ${currentPage}`);
    allEntries = allEntries.concat(entries);

    if (currentPage === maxPages) {
      console.log("Reached maximum page limit. Stopping.");
      break;
    }

    // Locate the next page button using the data-page attribute.
    const nextPageSelector = `a.k-link[data-page="${currentPage + 1}"]`;
    const nextPageButton = await page.$(nextPageSelector);
    if (!nextPageButton) {
      console.log("Next page button not found. Stopping pagination.");
      break;
    }

    console.log(`Navigating to page ${currentPage + 1}...`);
    await nextPageButton.click();
    await sleep(3000); // Wait for new page content to load.
    currentPage++;
  }

  // Save the extracted data to a JSON file with pretty formatting.
  const outputPath = path.join(__dirname, 'licitaciones_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allEntries, null, 2), 'utf-8');
  console.log(`Data saved to ${outputPath}`);

  // Optionally, print out a formatted list in the console.
  console.log("Entries found:");
  allEntries.forEach((entry, index) => {
    console.log(`${String(index + 1).padEnd(3, ' ')} | ${entry["Tipo de Solicitud"]} | ${entry["Título"]} | ${entry["Fecha de Publicación"]} | ${entry["Estado"]}`);
  });

  await browser.close();
})();
