const accountsFilePath = './accounts.json'

if (!fs.existsSync(accountsFilePath)) fs.writeFileSync(accountsFilePath, JSON.stringify({}))
const accounts = JSON.parse(fs.readFileSync(accountsFilePath, { encoding: 'utf8' }))

/*

// ACCOUNT
if (data.t == "login") {
    let { username, password } = data;
    if (accounts.hasOwnProperty(username)) {
        if (accounts[username] == password) {
            ws.send(JSON.stringify({ t: data.t, result: "SUCCESS" }))
        } else {
            ws.send(JSON.stringify({ t: data.t, result: "WRONG_PASS" }))
        }
    } else {
        ws.send(JSON.stringify({ t: data.t, result: "NO_ACC" }))
    }
}
if (data.t == "register") {
    let { username, password } = data;

    if (accounts.hasOwnProperty(username)) {
        ws.send(JSON.stringify({ t: data.t, result: "EXIST" }))
    } else {
        accounts[username] = password;
        ws.send(JSON.stringify({ t: data.t, result: "SUCCESS" }))
        fs.writeFileSync(accountsFilePath, JSON.stringify(accounts, null, 4))
    }
}
if (data.t == "changePassword") {
    let { username, oldPassword, newPassword } = data;
    if (accounts.hasOwnProperty(username)) {
        if (accounts[username] == oldPassword) {
            accounts[username] = newPassword;
            ws.send(JSON.stringify({ t: data.t, result: "SUCCESS" }))
            fs.writeFileSync(accountsFilePath, JSON.stringify(accounts, null, 4))
        } else {
            ws.send(JSON.stringify({ t: data.t, result: "WRONG_PASS" }))
        }
    } else {
        ws.send(JSON.stringify({ t: data.t, result: "NO_ACC" }))
    }
}

*/