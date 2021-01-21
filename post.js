document.getElementById("post").addEventListener("click", function(){post()})

async function post() {
   let jwk;
     
    const md = window.markdownit()
                // prevent XSS attacks
               .set({'html': false}); 
    const arweave = Arweave.init()
    const pub = await arweave.wallets.jwkToAddress(JSON.parse(jwk))

    const txt = document.getElementById("tags").value

    const result = `<html><body><section id="post">${md.render(txt)}</section></body></html>`

    let transaction = await arweave.createTransaction(
    {

        data: result
    }, JSON.parse(jwk)

    );


    transaction.addTag("App-Name", "w3gram");
    transaction.addTag("version", "0.0.1");
    transaction.addTag("action", "post")
    transaction.addTag("Content-type", "text/html");
    transaction.addTag("tribus-name", "test-clan");
    transaction.addTag("tribus-id", "...communityXYZ...");
    transaction.addTag("unix-epoch", Date.now());
    transaction.addTag("userId", pub)

    await arweave.transactions.sign(transaction, JSON.parse(jwk))
    await arweave.transactions.post(transaction)
    console.log(transaction.id)

}
