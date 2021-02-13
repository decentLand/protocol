let jwk;
let pub_key;
const arweave = Arweave.init();
let tribus;
document.getElementById("post").addEventListener("click", function(){post()})

async function pkToPub(jwk){
    const arweave = Arweave.init()

    pub =  await arweave.wallets.jwkToAddress(JSON.parse(jwk))
    pub_key = pub;
    return pub

}

function readJwk(input) {
  let file = input.files[0];

  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = async function() {
    jwk = JSON.parse(reader.result); 
    document.getElementById("test").innerText = 
    `user-id: ${await pkToPub(reader.result)}`
    
     }  

  reader.onerror = function() {
    alert(reader.error);
    return
  };

};

async function userValidity() {

    const tribus_id = document.getElementById("id").value;
    const psc_tx =  await arweave.transactions.get(tribus_id)
    const owner = psc_tx["owner"];


    if ( owner != jwk["n"] ){
        alert("You must create Tribus with the same wallet used to create the PSC")
        return

    } else {

        await pscValidity(tribus_id)
    }

    
}

async function pscValidity(psc_id) {
    const request = await fetch(`https://cache.community.xyz/contract/${psc_id}`)

    const valid_contract_template = `https://cache.community.xyz/contract/${psc_id}`
    console.log(valid_contract_template)

    if (String(request["url"]) == valid_contract_template) {

        await createTribus()
    } else {
        alert("invalid contract id")
        return
    }
}


async function createTribus() {

    const tribus_name = document.getElementById("tribus-name").value;
    const description = document.getElementById("desc").value;
    const tribus_id = document.getElementById("id").value;
    const membership_entry = document.getElementById("me").value;
    const post_visibility = document.getElementById("visibility").value;
    const username = await get_profile(pub_key);


    // replace whitespace with dash in tribus_name input
    let tribus_name_modified = '';
    for (i = 0; i < tribus_name.length; i++) {
        if (tribus_name[i].charCodeAt(0) === 32) {
            tribus_name_modified += "-"
        }
        else {
            tribus_name_modified += tribus_name[i]
        }
    };


    if (typeof jwk == "undefined") {
        alert("please import your wallet")
        return
     };

    const tribusObject = {

        tribus_name_modified,
        tribus_id,
        description,
        membership_entry,
        post_visibility,
        "creator": username,
        "creator_id": pub_key,
    };


    const transaction = await arweave.createTransaction(
        {
            data: JSON.stringify(tribusObject)
        },
            jwk
        );

    transaction.addTag("App-Name", "decent.land");
    transaction.addTag("action", "createTribus");
    transaction.addTag("version", "9.0.1");
    transaction.addTag("tribus name", tribus_name_modified)
    transaction.addTag("tribus id", tribus_id)
    transaction.addTag("Content-Type", "application/json");
    transaction.addTag("creator", username);
    transaction.addTag("creator id", pub_key)
    transaction.addTag("unix-epoch", Date.now())


    await arweave.transactions.sign(transaction, jwk);
    await arweave.transactions.post(transaction)

    alert(`Tribus creation txID ${transaction.id}`)

}   


async function get_profile(pub_key) {

    


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

     // last_registration_tx as signup data to be applicable later on account metada update.
     const last_registration_tx =  (res["data"][0])

     const tx_data = await arweave.transactions.getData(last_registration_tx, {decode: true, string: true});
     const usr_obj = JSON.parse(tx_data)

     username = usr_obj["username"];

    
     return username
     } else if (res["data"].length === 0) {

        username = `guest_${pub_key.slice(0, 7)}`;
        return username;
       

     }
     
};


 //  
 // 
 // posting
 // 
 // 
 // 

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

     // last_registration_tx as signup data to be applicable later on account metada update.
     const last_registration_tx =  (res["data"][0])

     const tx_data = await arweave.transactions.getData(last_registration_tx, {decode: true, string: true});
     const usr_obj = JSON.parse(tx_data)

     username = usr_obj["username"];
     pfp = usr_obj["pfp"];

     document.getElementById("username-holder").innerHTML = `You are going to post as <b>@${username}</b>`
     document.getElementById("pfp").src = `https://arweave.net/${pfp}`;
     } else if (res["data"].length === 0) {

        username = `guest_${pub_key.slice(0, 7)}`;
        // standard pfp for all guests
        pfp = "78WdrVhNZ2i_KbimqcV4j-drX04HJr3E6UyD7xWc84Q";

        document.getElementById('pfp').src = `https://arweave.net/${pfp}`;
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

    let transaction2 = await arweave.createTransaction(
    {
        data: txt
    },
    JSON.parse(jwk)

        );

     transaction2.addTag("App-Name", "decent.land");
     transaction2.addTag("version", "9.0.1");
     transaction2.addTag("action", "post");
     transaction2.addTag("Content-Type", "text/plain");

     transaction2.addTag("tribus-id", tribus_id)
     transaction2.addTag("username", username);
     transaction2.addTag("user-id", pub_key);
     transaction2.addTag("pfp", pfp)
     transactio2.addTag("Protocol", "SQUAD");
     transaction2.addTag("Type", "Post");
     transaction2.addTag("unix-epoch", Date.now());

    await arweave.transactions.sign(transaction, JSON.parse(jwk));
    await arweave.transactions.post(transaction)


    
    alert(`Your post has been broadcasted.
          
           Post ID: ${transaction.id}`)

};