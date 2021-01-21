async function sendRequest() {

    const arweave = Arweave.init();
    const username = document.getElementById("username").value
    const userId = pub_key;

    const userObject = {

        "username": username,
        "user_id": userId,
        "registration_unix_epoch": Date.now()
    };

    const transaction = await arweave.createTransaction(
        {
            data: JSON.stringify(userObject)
        },
            JSON.parse(jwk)
        );

    transaction.addTag("App-Name", "web3gram");
    transaction.addTag("username", username);
    transaction.addTag("version", "0.0.1");
    transaction.addTag("action", "signup");
    transaction.addTag("Content-Type", "application/json");
    transaction.addTag("user-id", pub_key);
    transaction.addTag("unix-epoch", userObject["registration_unix_epoch"])
        
    await arweave.transactions.sign(transaction, JSON.parse(jwk));
    await arweave.transactions.post(transaction)
    alert(transaction.id)

};

export sendRequest
