document.getElementById("post").addEventListener("click", function(){post()})

const arweave = Arweave.init();
const readState = smartweave.readContract
let tribuses_objj = {}
let jwk;
let pub_key;
let username;
let pfp;



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

    let transaction = await arweave.createTransaction(
    {
        data: txt
    },
    JSON.parse(jwk)

        );



    const TRIBUS_NAME = (document.getElementById("tribus-list").value)
   
    
    if (TRIBUS_NAME == "public-square") {

     transaction.addTag("App-Name", "PublicSquare");
     transaction.addTag("App-Name", "SmartWeaveContract");
     transaction.addTag("Version", "1");
     transaction.addTag("Type", "post");
     transaction.addTag("App-Version", "0.3.0");
//      atomic NFt post initialization
     transaction.addTag("Contract-Src", "I8xgq3361qpR8_DvqcGpkCYAUTMktyAgvkm6kGhJzEQ");
     transaction.addTag("Init-State", `{"owner":"${pub_key}","name":"${username}'s post","ticker":"DL-NFT-${username}-${Date.now()}","description":"decent.land post - PublicSquare", "balances": {"${pub_key}": 1}`)
     transaction.addTag("Content-Type", "text/plain");
     transaction.addTag("protocol", "decent.land");
     transaction.addTag("v-protocol", "0.0.1");
     transaction.addTag("tribus-name", "public-square");
     transaction.addTag("tribus-id", null);
     transaction.addTag("username", username);
     transaction.addTag("user-id", pub_key);
     transaction.addTag("pfp", pfp);
//       PublicSquare posts are also under $QUAD protocol by github.com/t8 
     transaction.addTag("Protocol", "SQUAD");
//       listing the NFT in Verto marketplace
     transaction.addTag("Action", "marketplace/Create");
     transaction.addTag("Exchange", "Verto");
     transaction.addTag("unix-epoch", Date.now());

    } else  {

        if (await isHolder(tribuses_objj[TRIBUS_NAME]["tribus-id"], tribuses_objj[TRIBUS_NAME]["visibility"] ) 
            && await isStaker(tribuses_objj[TRIBUS_NAME]["tribus-id"], tribuses_objj[TRIBUS_NAME]["entry"])) {

            transaction.addTag("App-Name", "decent.land");
            transaction.addTag("App-Name", "SmartWeaveContract");
            transaction.addTag("version", "0.0.1");
            transaction.addTag("action", "post");
            transaction.addTag("App-Version", "0.3.0");
            transaction.addTag("Contract-Src", "I8xgq3361qpR8_DvqcGpkCYAUTMktyAgvkm6kGhJzEQ");
            transaction.addTag("Init-State", `{"owner":"${pub_key}","name":"${username}'s post","ticker":"DL-NFT-${username}-${Date.now()}","description":"decent.land post - ${document.getElementById("tribus-list").value}", "balances": {"${pub_key}": 1}`)
            transaction.addTag("Content-Type", "text/plain");
            transaction.addTag("tribus-id", tribuses_objj[TRIBUS_NAME]["tribus-id"])
            transaction.addTag("tribus-name", document.getElementById("tribus-list").value)
            transaction.addTag("username", username);
            transaction.addTag("user-id", pub_key);
            transaction.addTag("pfp", pfp);
            transaction.addTag("Action", "marketplace/Create");
            transaction.addTag("Exchange", "Verto");
            transaction.addTag("unix-epoch", Date.now());


        } else {
            alert("you can't post, please check Tribus requirements")
            return
        }


     

    }

    await arweave.transactions.sign(transaction, JSON.parse(jwk));
    await arweave.transactions.post(transaction)


    
    alert(`Post ID: ${transaction.id}`)

};


const tribuses_map = new Map();

async function get_tribuses() {

    let tribus_list = {
        op: 'and',
        expr1: {
            op: 'equals',
            expr1: 'action',
            expr2: 'createTribus'
        },

        expr2: {
            op: 'and',
            expr1: {
                op: 'equals',
                expr1: 'App-Name',
                expr2: 'decent.land'
            },

            expr2: {
                op: 'and',
                expr1: {
                op: 'equals',
                expr1: 'Content-Type',
                expr2: 'application/json'
            },

            expr2: {
                op: 'equals',
                expr1: 'version',
                expr2: 'mainnet'
            }
            }
        }
    }



    const res = await arweave.api.post(`arql`, tribus_list)


    return res["data"]
}


async function filter_owners() {
    const tribuses_list = await get_tribuses();

    for (tribus_tx of tribuses_list) {
        const tx_status = await arweave.transactions.getStatus(tribus_tx)
        if (tx_status["status"] != 200) {continue}
        const tx_data = await arweave.transactions.get(tribus_tx)
        const owner = tx_data["owner"]
        console.log(owner)

        tribuses_map.has(owner) ? console.log("already added") : tribuses_map.set(owner, tribus_tx)

    }

    const tribuses_obj = Object.fromEntries(tribuses_map.entries())
    console.log(Object.values(tribuses_obj))
    return Object.values(tribuses_obj)
}

async function get_tribus_obj() {
    const tribusTxs = await filter_owners();
    const tribuses = {};


    for (tx of tribusTxs) {

        const tx_data = await arweave.transactions.get(tx)
        const tags = await tx_data.get('tags')
        const tx_obj = {}
        for (tag of tags) {
            const key = tag.get("name", {decode: true, string: true})
            const value = tag.get("value", {decode: true, string: true})

            if (key == 'tribus-id' || key == 'tribus-name' || key == "visibility" || key == "entry" ) {

                Object.defineProperty(tx_obj, key, {value: value})

            }
        }

        let select = document.getElementById("tribus-list");
        const option = document.createElement("option")
        option.text = tx_obj["tribus-name"];
        option.id = tx_obj["tribus-name"];
        select.add(option) 
        console.log(tx_obj)
        Object.defineProperty(tribuses_objj, tx_obj["tribus-name"], {value: {"tribus-id" : tx_obj["tribus-id"],
                                                                            "entry": tx_obj["entry"],
                                                                            "visibility": tx_obj["visibility"]}})
        console.log(tribuses_objj)

        
    }

    
}



async function whatTribus(input) {
    const t_name = input.value;

    // const visibility = tribuses_objj?.[t_name]?.["visibility"]
    const visibility = tribuses_objj[t_name] ? tribuses_objj[t_name]["visibility"] : undefined
    // const entry = tribuses_objj?.[t_name]?.["entry"]
    const entry = tribuses_objj[t_name] ? tribuses_objj[t_name]["entry"] : undefined

    if (visibility && entry) {
        document.getElementById("tribus-info").innerHTML = 
        `post visibility: <b>${visibility}</b> | membership entry: <b>${entry}</b> (${await get_ticker(t_name)})`
        
    } else {
        document.getElementById("tribus-info").innerHTML = ''
    }
};

async function isHolder(t_id, visibility) { 

    const data = await readState(arweave, String(t_id));
    console.log(data["balances"][pub_key])
    return data["balances"][pub_key] >= visibility
}

// async function isStaker(t_id, membership) {
//     let locked_balance = 0;
//     const community_xyz = "https://cache.community.xyz/contract/"
//     const res = await fetch(`${community_xyz}${t_id}`)
//     const psc_data = await res.json()
    
//     const vault = psc_data["vault"][pub_key]

//     if (vault) {
//         for (item of vault) {
//             locked_balance += item["balance"]
//             console.log(`locked balance = ${locked_balance}`)
//         }
//     }
                 


//        return locked_balance >= Number(membership)
// }

async function isStaker(t_id, membership) {
    let locked_balance = 0;
    console.log(`tid`, t_id)
    const data = await readState(arweave, t_id);
    // pub_key is retrieved from the lexical scope
    const address_existence = data["vault"][pub_key];

    if (address_existence) {
        for (balance of address_existence) {
            locked_balance += balance["balance"]
            console.log(`locked balance = ${locked_balance}`)
        }

    }

    return locked_balance >= Number(membership)
};

async function get_ticker(t_name) {
  const t_id = tribuses_objj[t_name]["tribus-id"]
  const data = await readState(arweave, t_id);
  const ticker = data["ticker"];

  return ticker
};

get_tribus_obj()
