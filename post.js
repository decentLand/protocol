document.getElementById("post").addEventListener("click", function(){post()})

const arweave = Arweave.init()
let jwk;
let pub_key;
let username;

function readFile(input) {
  let file = input.files[0];

  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = async function() {
    jwk = reader.result;
    pub_key = await arweave.wallets.jwkToAddress(JSON.parse(jwk))
    console.log(pub_key);
    get_profile()

    }
  reader.onerror = function() {
    console.log(reader.error);
  };

};




async function get_profile() {

    


    let get_applicant_wallet =
            {
                op: 'and',
                expr1:
                    {
                        op: 'equals',
                        expr1: 'user-id',
                        expr2: pub_key,
                    },
                
                expr2:
                    {
                      op: 'and',
                        expr1: 
                                {
                                    op: 'equals',
                                    expr1: 'App-Name',
                                    expr2: 'decent.land'
                                },

   
                        expr2:
                            {
                            op: 'and',
                              expr1:
                                
                                    {
                                        op:'equals',
                                        expr1: 'version',
                                        expr2: '0.0.1',
                                    },
                                
                                expr2:
                                    
                                    {
                                        op: 'and',
                                            expr1:

                                            {
                                                op:'equals',
                                                expr1: 'action',
                                                expr2: 'signup'
                                            },

                                            expr2:
                                                
                                                {
                                                    op: 'and',
                                                        expr1:

                                                        {
                                                            op: 'equals',
                                                            expr1: 'Content-Type',
                                                            expr2: 'application/json',
                                                        },

                                                        expr2:
                                                        
                                                        {
                                                            op: 'equals',
                                                            expr1: 'from',
                                                            expr2: pub_key,
                                                        },
                                                },
                                    },

                            },
                    },

            }
                    
     
     const res = await arweave.api.post('arql', get_applicant_wallet)
     
     if (res["data"].length > 0 ) {

     const last_registration_tx =  (res["data"][res["data"].length - 1])
     const tx_data = await arweave.transactions.getData(last_registration_tx, {decode: true, string: true});
     const usr_obj = JSON.parse(tx_data)

     username = usr_obj["username"];
     document.getElementById("username-holder").innerHTML = `You are going to post as <b>@${username}</b>`
     } else if (res["data"].length === 0) {

        username = `guest_${pub_key.slice(0, 7)}`
        document.getElementById("username-holder").innerHTML = 

        `There is no username bound to your wallet.
        <br>
        You are going to post as <b>@${username}</b>`

     }
     
}




async function post() {
 
     
    const md = window.markdownit()
                // prevent XSS attacks
               .set({'html': false}); 
    const arweave = Arweave.init()

    const txt = document.getElementById("post-text").value
   
    if (txt.length === 0) {
        alert("You can't post with empty text")
        return
    }

    if (typeof jwk === "undefined") {
        alert("please import your wallet")
        return
    }

    const tx_obj = {
        username: username,
        userId: pub_key,
        text: txt,
        tribus_name: "open-square",
        tribus_id: null,
        unix_epoch: Date.now()
    }

    let transaction = await arweave.createTransaction(
    {

        data: JSON.stringify(tx_obj)
    }, JSON.parse(jwk)

    );


    transaction.addTag("App-Name", "decent.land");
    transaction.addTag("version", "0.0.1");
    transaction.addTag("action", "post")
    transaction.addTag("Content-type", "application/json");
    transaction.addTag("tribus-name", "open-square");
    transaction.addTag("tribus-id", "None");
    transaction.addTag("unix-epoch", tx_obj["unix_epoch"]);


    await arweave.transactions.sign(transaction, JSON.parse(jwk))
    await arweave.transactions.post(transaction)
    alert(`Your post ID: ${transaction.id}`)

}
