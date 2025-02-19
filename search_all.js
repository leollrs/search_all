const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runAllScripts() {
  try {
    // Run search scripts.
    console.log("Running Grants.gov search (search_DE.js)...");
    let { stdout, stderr } = await execPromise('node search_DE.js');
    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("Running ASG Subastas search (search_asg.js)...");
    ({ stdout, stderr } = await execPromise('node search_asg.js'));
    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("Running Third search bot (search_grants.js)...");
    ({ stdout, stderr } = await execPromise('node search_grants.js'));
    console.log(stdout);
    if (stderr) console.error(stderr);

    // Run CSV conversion scripts.
    console.log("Running Third search CSV conversion (DE_convert_to_json.js)...");
    ({ stdout, stderr } = await execPromise('node DE_convert_to_json.js'));
    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("Running ASG Subastas CSV conversion (asg_convert_to_csv.js)...");
    ({ stdout, stderr } = await execPromise('node asg_convert_to_csv.js'));
    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("Running Grants.gov CSV conversion (grants_convert_to_csv.js)...");
    ({ stdout, stderr } = await execPromise('node grants_convert_to_csv.js'));
    console.log(stdout);
    if (stderr) console.error(stderr);

    // Launch the Streamlit dashboard that displays all three tables.
    console.log("Launching Streamlit dashboard (all_data.py)...");
    ({ stdout, stderr } = await execPromise('streamlit run all_data.py'));
    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log("All scripts have been run successfully!");
  } catch (err) {
    console.error("Error running scripts:", err);
  }
}

runAllScripts();

