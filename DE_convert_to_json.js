const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Define file paths
const jsonFilePath = path.join(__dirname, 'licitaciones_data.json');
const csvFilePath = path.join(__dirname, 'licitaciones_data.csv');

// Load JSON data
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

// Define CSV headers
const csvWriter = createCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'Tipo de Solicitud', title: 'Tipo de Solicitud' },
    { id: 'Título', title: 'Título' },
    { id: 'Fecha de Publicación', title: 'Fecha de Publicación' },
    { id: 'Estado', title: 'Estado' }
  ]
});

// Write JSON data to CSV
csvWriter.writeRecords(jsonData)
  .then(() => console.log(`✅ Data saved to ${csvFilePath}`))
  .catch(err => console.error("❌ Error writing CSV:", err));
