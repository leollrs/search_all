const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log("Opening https://www.asg.pr.gov/subastas...");
  await page.goto('https://www.asg.pr.gov/subastas', { waitUntil: 'networkidle2' });

  const maxPages = 5;
  let currentPage = 1;
  let allResults = [];

  // Main loop for pages
  while (currentPage <= maxPages) {
    console.log(`Processing page ${currentPage}...`);
    // Wait for the description paragraphs to load.
    await page.waitForSelector("p[style*='position: absolute'][style*='top: 22rem']", { timeout: 60000 });

    // For each description paragraph, find the closest preceding <h1> with the desired style.
    const pairs = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll("p[style*='position: absolute'][style*='top: 22rem']"));
      return paragraphs.map(p => {
        let title = "No title found";
        let prev = p.previousElementSibling;
        while (prev) {
          if (prev.tagName.toLowerCase() === 'h1' && (prev.getAttribute('style') || "").includes("top: 3rem")) {
            title = prev.textContent.trim();
            break;
          }
          prev = prev.previousElementSibling;
        }
        return {
          title,
          description: p.textContent.trim()
        };
      });
    });

    console.log(`Found ${pairs.length} listings on page ${currentPage}.`);

    // For each listing, click its "Ver" button to get additional details.
    for (let i = 0; i < pairs.length; i++) {
      console.log(`Processing listing ${i + 1} on page ${currentPage}...`);

      // Re-query the "Ver" buttons to avoid stale element handles.
      const verButtons = await page.$$('button.btn.btn-success');
      if (i >= verButtons.length) {
        console.log("Not enough 'Ver' buttons found on this page.");
        break;
      }
      // Click the i-th "Ver" button and wait for the detail page to load.
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
        verButtons[i].click()
      ]);

      // On the detail page, extract additional information.
      const detailInfo = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[target="_blank"]'));
        let preSubasta = null;
        let actoApertura = null;
        anchors.forEach(a => {
          const txt = a.innerText;
          if (txt.includes('Reunión Pre Subasta')) {
            preSubasta = txt.replace('Reunión Pre Subasta', '').trim();
          }
          if (txt.includes('Acto de Apertura')) {
            actoApertura = txt.replace('Acto de Apertura', '').trim();
          }
        });
        return { preSubasta, actoApertura };
      });

      // Merge the detail info into the current listing object.
      pairs[i].preSubasta = detailInfo.preSubasta;
      pairs[i].actoApertura = detailInfo.actoApertura;

      // Go back to the main page.
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
        page.goBack()
      ]);
      // Wait for the description paragraphs to be ready again.
      await page.waitForSelector("p[style*='position: absolute'][style*='top: 22rem']", { timeout: 60000 });
    }

    // Append the listings from this page to the global results.
    allResults = allResults.concat(pairs);

    // Check for the "Próxima" (Next) button to paginate.
    if (currentPage === maxPages) break;
    const links = await page.$$('a.page-link');
    let nextButton = null;
    for (const link of links) {
      const text = await page.evaluate(el => el.textContent, link);
      if (text.includes('Próxima')) {
        nextButton = link;
        break;
      }
    }
    if (nextButton) {
      console.log("Navigating to next page...");
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
        nextButton.click()
      ]);
      currentPage++;
    } else {
      console.log("Next page button not found. Exiting loop.");
      break;
    }
  }

  // Output the results in a neat title/description/detail format.
  console.log("All Listings:");
  allResults.forEach((listing, index) => {
    console.log(`${String(index + 1).padEnd(3, ' ')} Title: ${listing.title}`);
    console.log(`     Description: ${listing.description}`);
    console.log(`     Reunión Pre Subasta: ${listing.preSubasta || 'N/A'}`);
    console.log(`     Acto de Apertura: ${listing.actoApertura || 'N/A'}\n`);
  });

  // Save the final results to a JSON file.
  const outputPath = path.join(__dirname, 'subastas_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`Data saved to ${outputPath}`);

  await browser.close();
})();
