const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractTableData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Wait for the page to load completely
  await page.waitForSelector('table');

  // Extract table data
  const tableData = await page.evaluate(() => {
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tr');
    const data = [];

    rows.forEach(row => {
      const rowData = [];
      const cells = row.querySelectorAll('th, td');
      cells.forEach(cell => {
        rowData.push(cell.innerText.trim());
      });
      data.push(rowData);
    });

    return data;
  });

  await browser.close();
  return tableData;
}

async function saveAsCSV(data, filename) {
  const csvContent = data.map(row => row.join(',')).join('\n');
  fs.writeFileSync(filename, csvContent);
  console.log('CSV file saved:', filename);
}

async function saveAsJSON(data, filename) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFileSync(filename, jsonData);
  console.log('JSON file saved:', filename);
}

async function main() {
  const websiteUrl = process.argv[2];
  if (!websiteUrl) {
    console.error('Please provide a website URL as an argument.');
    return;
  }

  try {
    const tableData = await extractTableData(websiteUrl);
    if (tableData.length === 0) {
      console.error('No table data found on the webpage.');
      return;
    }

    const csvFilename = 'table_data.csv';
    const jsonFilename = 'table_data.json';

    await saveAsCSV(tableData, csvFilename);
    await saveAsJSON(tableData, jsonFilename);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();