
const worldsFolderPath = './worlds/'

if (!fs.existsSync(worldsFolderPath)) fs.mkdirSync(worldsFolderPath)
const worlds = Object.fromEntries(Object.entries(fs.readdirSync(worldsFolderPath).map(worldJSON => JSON.parse(fs.readFileSync(worldsFolderPath + worldJSON, { encoding: 'utf8' })))).map((v, i, a) => {
    return v = [fs.readdirSync(worldsFolderPath)[i].replace('.json', ''), v[1]]
}));

let worldsAutoSaveInt = setInterval(() => {
    // console.log("\n" + "-".repeat(10))
    // console.log("Saving worlds...")
    for (let i = 0; i < Object.keys(worlds).length; i++) {
        const worldName = Object.keys(worlds)[i];
        const worldData = worlds[worldName];
        const worldPath = worldsFolderPath + worldName + ".json";
        fs.writeFileSync(worldPath, JSON.stringify(worldData).replace(/null/g, 0))
        console.log(" [OK] " + worldName)
    }
    // console.log("-".repeat(10) + "\n")
}, 10000);
