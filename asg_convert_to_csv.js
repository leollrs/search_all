const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define file paths
const jsonFilePath = path.join(__dirname, 'subastas_data.json');
const csvFilePath = path.join(__dirname, 'subastas_data.csv');

// Load JSON data
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

// Define CSV headers based on JSON keys
const csvWriter = createCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'title', title: 'Title' },
    { id: 'description', title: 'Description' },
    { id: 'preSubasta', title: 'Reunión Pre Subasta' },
    { id: 'actoApertura', title: 'Acto de Apertura' }
  ]
});

// Write JSON data to CSV
csvWriter.writeRecords(jsonData)
  .then(() => console.log(`✅ Data saved to ${csvFilePath}`))
  .catch(err => console.error("❌ Error writing CSV:", err));
