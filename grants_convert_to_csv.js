const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define file paths
const jsonFilePath = path.join(__dirname, 'grants_data.json');
const csvFilePath = path.join(__dirname, 'grants_data.csv');

// Load JSON data
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

// Define CSV headers
const csvWriter = createCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'title', title: 'Grant Title' },
    { id: 'link', title: 'Grant Link' },
    { id: 'agency', title: 'Agency' },
    { id: 'deadline', title: 'Deadline' },
    { id: 'description', title: 'Description'}
  ]
});

// Write JSON data to CSV
csvWriter.writeRecords(jsonData)
  .then(() => console.log(`✅ Data saved to ${csvFilePath}`))
  .catch(err => console.error("❌ Error writing CSV:", err));
