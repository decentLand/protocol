async function sendRequest() {

    const arweave = Arweave.init();
    const username = document.getElementById("username").value
    const bio = document.getElementById("bio").value
    const userId = pub_key;
    
    
    // force username length
    if (username.length > 30 || username.length < 4) {
        alert("username must be between 4 and 30 characters");
        return
    };



    // replace whitespace with dash in username input
    let usr = '';
    for (i = 0; i < username.length; i++) {
        if (username[i].charCodeAt(0) === 32) {
            usr += "-"
        }
        else {
            usr += username[i]
        }
    };


    if (typeof jwk == "undefined") {
        alert("please import your wallet")
        return
     };
    
    
    const userObject = {

        "username": usr,
        "user_id": userId,
        "bio": bio,
        "registration_unix_epoch": Date.now()
    };

    const transaction = await arweave.createTransaction(
        {
            data: JSON.stringify(userObject)
        },
            JSON.parse(jwk)
        );

    transaction.addTag("App-Name", "decent.land");
    transaction.addTag("username", usr);
    transaction.addTag("version", "0.0.1");
    transaction.addTag("action", "signup");
    transaction.addTag("Content-Type", "application/json");
    transaction.addTag("user-id", pub_key);
    transaction.addTag("unix-epoch", userObject["registration_unix_epoch"])
        
    await arweave.transactions.sign(transaction, JSON.parse(jwk));
    await arweave.transactions.post(transaction)
    alert(`registration txID ${transaction.id}`)

};

export sendRequest
