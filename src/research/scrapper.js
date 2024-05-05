const puppeteer = require('puppeteer');
const fs = require('fs');
const { stringify } = require('csv-stringify');

// Function to get dropdown options
async function getOptions(page, selector) {
    return await page.evaluate((selector) => {
        const options = Array.from(document.querySelector(selector).options);
        return options.map(option => ({
            text: option.text,
            value: option.value
        }));
    }, selector);
}

async function scrapeData() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://ejalshakti.gov.in/JJM/JJMReports/BasicInformation/JJMRep_AbstractData_D.aspx?Istate=cMpX3xtH%2bqA%3d&IAgency=kB7W%2fchXC9g%3d&IDistrict=gMqMutIC0u0%3d&Iblock=gMqMutIC0u0%3d&IFinyear=joOf9Wxy6nf0qdH7vFm42w%3d%3d&ICategory=5C1KxeqUjmo%3d', { waitUntil: 'networkidle0' });

    await page.waitForSelector('#CPHPage_ddFinyear'); // Wait for the first dropdown to appear

    // Fetch dropdown options
    const districts = await getOptions(page, '#CPHPage_ddDistrict');
    const blocks = await getOptions(page, '#CPHPage_ddBlock');
    const categories = await getOptions(page, '#CPHPage_ddCategory');

    let allData = [];

    for (let district of districts) {
        await page.select('#CPHPage_ddDistrict', district.value);

        for (let block of blocks) {
            await page.select('#CPHPage_ddBlock', block.value);

            for (let category of categories) {
                await page.select('#CPHPage_ddCategory', category.value);
                await page.click('#CPHPage_btnShow'); // Assume there's a Show button to refresh the data
                await page.waitForSelector('#tableReportTable', { visible: true, timeout: 10000 });

                const data = await page.evaluate(() => {
                    const rows = Array.from(document.querySelectorAll('#tableReportTable tr'));
                    return rows.map(row => {
                        const columns = row.querySelectorAll('th, td');
                        return Array.from(columns, column => column.innerText.trim().replace(/\n/g, ' '));
                    });
                });

                // Prepend metadata
                data.forEach(row => allData.push([district.text, block.text, category.text, ...row]));
            }
        }
    }

    await browser.close();

    // Save to CSV file
    stringify(allData, {
        header: true,
        columns: ['District', 'Block', 'Category', 'S.No.', 'District', 'Blocks', 'Panchayats', 'Total Villages', 'Villages', 'Habitations', 'HouseHolds', 'Population']
    }, (err, output) => {
        if (err) throw err;
        fs.writeFile('data.csv', output, (err) => {
            if (err) throw err;
            console.log('data.csv saved.');
        });
    });
}

scrapeData();