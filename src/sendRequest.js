const identicons = ["9NIxzk99mjkKVa4_jl9EgncJks5wVlxp_LIvEWDuKyA", "12kZuMT3P-RHkyHNrNeH-12SC9WKnlLz3CitPquTIfU", "pTADN_N_M0rZBAPj0nKlVqatmncOzQ1MGUHMOxnHbc0",
                    "YIIOVeXyzHu-PKE-9L8fxCWTrLEm32wEn62t_BE7cvs", "t9PxVURNO-TaoMaEAizBzwbSqcq0AmU3uwhPiE4adfY", "UkLaA8RkJGlXp1oDzApvSVZLapYD6_d2X3GBYrZFWHk",
                    "klWbfS1ZREyb2g-PZ79iJE1UHsFf4hQMKqXg72DCXOw", "ukFDu-nFUeAgFIldtd28m1114udMRti2Vfv0hXY-uwU", "qAgFNVwmRs8L6s8n7_RRDMCzn_V7g634posoQasreRs",
                    "yJa8hVvmyWdlSYjX2Jn0FcnDJMl7-tbYDejuWVT5r5o", "KePbvEa55KXavT7WNITRflTwRUK42KARqY_Fyd08JJ4", "8PPhRziuLUpokhvoeezIjCGP450ZhHYo5HG5upOeMOI"]


function generate_random_pfp() {

    return identicons[Math.floor( Math.random() * identicons.length)]
};

async function sendRequest() {

    const arweave = Arweave.init();
    const username = document.getElementById("username").value;
    const bio = document.getElementById("bio").value;
    const pfp = generate_random_pfp();
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
        "pfp": pfp,
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
