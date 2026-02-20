import fs from 'fs';

const url = 'https://script.google.com/macros/s/AKfycbx6GxOz1-eLayDttrhHvocmDFYVl7jwLWOJtCm3LrRFuRxU4mFoXGG9bfWRNYl47sf1RA/exec';

console.log(`Fetching from: ${url}`);

fetch(url)
    .then(res => res.json())
    .then(data => {
        let output = "";
        if (data.data && data.data.length > 0) {
            const keys = Object.keys(data.data[0]);
            output += "Keys: " + JSON.stringify(keys) + "\n";
            output += "Sample: " + JSON.stringify(data.data[0], null, 2) + "\n";
            output += "Access '# Installations': " + data.data[0]['# Installations'] + "\n";
        } else {
            output += "No data found.\n";
        }
        fs.writeFileSync('debug-output.txt', output);
        console.log("Written to debug-output.txt");
    })
    .catch(err => console.error("Fetch Error:", err));
