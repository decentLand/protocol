const arweave = Arweave.init({
    host: 'arweave.net'
})
const readState = smartweave.readContract
const Arverify = arverify.getVerification
const posts = [];
let tribuslist = []
let tribuses_map = new Map()

async function get_profile(address) {

    


    // let get_applicant_wallet =
    //         {
    //             op: 'and',
    //             expr1:
    //                 {
    //                     op: 'equals',
    //                     expr1: 'user-id',
    //                     expr2: address,
    //                 },
                
    //             expr2:
    //                 {
    //                   op: 'and',
    //                     expr1: 
    //                             {
    //                                 op: 'equals',
    //                                 expr1: 'App-Name',
    //                                 expr2: 'decent.land'
    //                             },

   
    //                     expr2:
    //                         {
    //                         op: 'and',
    //                           expr1:
                                
    //                                 {
    //                                     op:'equals',
    //                                     expr1: 'version',
    //                                     expr2: '0.0.1',
    //                                 },
                                
    //                             expr2:
                                    
    //                                 {
    //                                     op: 'and',
    //                                         expr1:

    //                                         {
    //                                             op:'equals',
    //                                             expr1: 'action',
    //                                             expr2: 'signup'
    //                                         },

    //                                         expr2:
                                                
    //                                             {
    //                                                 op: 'and',
    //                                                     expr1:

    //                                                     {
    //                                                         op: 'equals',
    //                                                         expr1: 'Content-Type',
    //                                                         expr2: 'application/json',
    //                                                     },

    //                                                     expr2:
                                                        
    //                                                     {
    //                                                         op: 'equals',
    //                                                         expr1: 'from',
    //                                                         expr2: address,
    //                                                     },
    //                                             },
    //                                 },

    //                         },
    //                 },

    //         }
                    
     
     // const res = await arweave.api.post('arql', get_applicant_wallet)
     const res = await getUserProfile(address)
     
     if (res.length > 0 ) {

     // last_registration_tx as signup data to be applicable later on account metada update.
     console.log("res", res)
     const last_registration_tx =  (res[0])

     const tx_data = await arweave.transactions.getData(last_registration_tx, {decode: true, string: true});
     const usr_obj = JSON.parse(tx_data)

     const username = usr_obj["username"];
     const pfp = usr_obj["pfp"];
     const bio = usr_obj["bio"];
  
     return {
        username,
        pfp,
        bio
     };


     } else if (res.length === 0) {

        const username = `guest_${address.slice(0, 7)}`;
        // standard pfp for all guests
        const pfp = "78WdrVhNZ2i_KbimqcV4j-drX04HJr3E6UyD7xWc84Q";
        const bio = "a random arweaver"
     
        return {
            username,
            pfp,
            bio
        };

   

     }
     
};



async function display_posts({id, name, visibility, app}) {
    console.log(id, name, visibility, app)


    // let get_ps_posts =
    //         {
    //             op: 'and',
    //             expr1:
    //                 {
    //                   op: 'equals',
    //                   expr1: 'App-Name',
    //                   expr2: app
    //                 },

    //                 expr2:
    //                 {
    //                     op: 'and',
    //                     expr1:
    //                     {
    //                         op: 'equals',
    //                         expr1: 'Content-Type',
    //                         expr2: 'text/plain'
    //                     },

    //                     expr2:
    //                     {
    //                         op: 'or',
    //                         expr1: 
    //                         {
    //                             op: 'equals',
    //                             expr1: 'action',
    //                             expr2: 'post'

    //                         },
    //                         expr2:
    //                         {
    //                             op: 'and',
    //                             expr1:
    //                             {
    //                                 op: 'equals',
    //                                 expr1: 'Type',
    //                                 expr2: 'post'
    //                             },

    //                             expr2:
    //                             {
    //                                 op: 'and',
    //                                 expr1:
    //                                 {
    //                                     op: 'equals',
    //                                     expr1: 'protocol',
    //                                     expr2: 'decent.land',
    //                                 },

    //                                 expr2:
    //                                 {
    //                                     op: 'and',
    //                                     expr1:
    //                                     {
    //                                         op: 'equals',
    //                                         expr1: 'tribus-id',
    //                                         expr2: id
    //                                     },

    //                                     expr2:
    //                                     {
    //                                         op: 'and',
    //                                         expr1:
    //                                         {
    //                                             op: 'equals',
    //                                             expr1: 'tribus-name',
    //                                             expr2: name,
    //                                         },
    //                                         expr2:
    //                                         {
    //                                             op: 'and',
    //                                             expr1:
    //                                             {
    //                                                 op: 'equals',
    //                                                 expr1: 'Version',
    //                                                 expr2: '1'
    //                                             },
    //                                             expr2:
    //                                             {
                                            
                                            
                                                
    //                                                     op: 'equals',
    //                                                     expr1: 'v-protocol',
    //                                                     expr2: '0.0.1'
    //                                                 },
                                                    
                                                
                                                
    //                                         }
    //                                     }
    //                                 }
                                    
    //                             }

    //                         }
                            
    //                     }
    //                 }
    //         };



                

    // const res = await arweave.api.post('arql', get_ps_posts)
    // const posts_list = res["data"]
    const posts_list = await getPostsTxs(app, id, name)
    console.log(posts_list)
    document.getElementById("tribusName").innerHTML = `Tribus: ${name}`
    // document.head.innerHTML += `<meta name="twitter:card" content="summary">
    // <meta name="twitter:title" content="Tribus forum: ${name}">
    // <meta name="twitter:image" content="https://arweave.net/RUaij2IDIpPVjhfcb4LnW8RIClr_gFTzwxovFfPoXxg">`
    



    for (post of posts_list) {
        // 
        const post_obj = {};

        let  status = await arweave.transactions.getStatus(post)
        status = status["status"]

        
        // load confirmed transactions only
        if (status != 200) {post = undefined};
    

        if (post != undefined) {

        const tx  = await arweave.transactions.get(post)
        const tags = await tx.get('tags')
        const post_text = ( await arweave.transactions.getData(post, {decode: true, string: true}) );
        
        post_obj["post_text"] = post_text;
        post_obj["post_id"] = post;


        for (tag of tags) {
        
        const key = tag.get('name', {decode: true, string: true});
        const value = tag.get('value', {decode: true, string: true});
     
        // check held PST per address for post visibilty

        if ( id != 'null') {

            if (key == 'user-id') {
            let address = value;
         
            if ( ! await isHolder(address, id, visibility) ) {

                post_obj["post_text"] =   `the user has decided to hide this posts`;
                post_obj["post_id"] = `hidden`;

                }

            }

        }
        
       // // //

        Object.defineProperty(post_obj, key, {value: value, configurable: true})

        }

        // last_* are profile's metadata: retrieved from the last signup tx

        const last_profile_data = await get_profile(post_obj["user-id"])

        const last_username = last_profile_data["username"]
        const last_pfp_url = `https://arweave.net/${last_profile_data["pfp"]}`
        
        post_obj["last_username"] = last_username;
        post_obj["last_pfp_url"] = last_pfp_url;


        const usernameAndCheckmark = await isArverified(post_obj["user-id"]) ?
        `<div class="user-fullname">${post_obj["last_username"] }  <div class="check"></div></div>` :
        `<div class="user-fullname">${post_obj["last_username"]}</div>`
        
        document.getElementById("content").innerHTML += 

        `<div class="tweet">
          <div class="user">
            <img src="${post_obj["last_pfp_url"]}" alt="" class="user-avatar">
          ${usernameAndCheckmark}
        <div class="user-username">${post_obj["user-id"]} </div>
          </div>
        <div class="tweet-text">
            ${post_obj["post_text"]}
        </div>
        <time class="tweet-time">
            post id: ${post_obj["post_id"]}
        </time>

        <style>

        :root {
  --borderWidth: 3.5px;
  --height: 12px;
  --width: 6px;
  --borderColor: blue;
}

body {
  padding: 1px;

}

.check {
  display: inline-block;
  transform: rotate(45deg);
  height: var(--height);
  width: var(--width);
  border-bottom: var(--borderWidth) solid var(--borderColor);
  border-right: var(--borderWidth) solid var(--borderColor);
}

</style>
   
        </div>`

 

        posts.push(post_obj)
        
        }

    };
    
}









// async function get_tribuses() {

//     // let tribus_list = {
//     //     op: 'and',
//     //     expr1: {
//     //         op: 'equals',
//     //         expr1: 'action',
//     //         expr2: 'createTribus'
//     //     },

//     //     expr2: {
//     //         op: 'and',
//     //         expr1: {
//     //             op: 'equals',
//     //             expr1: 'App-Name',
//     //             expr2: 'decent.land'
//     //         },

//     //         expr2: {
//     //             op: 'and',
//     //             expr1: {
//     //             op: 'equals',
//     //             expr1: 'Content-Type',
//     //             expr2: 'application/json'
//     //         },

//     //         expr2: {
//     //             op: 'equals',
//     //             expr1: 'version',
//     //             expr2: 'mainnet'
//     //         }
//     //         }
//     //     }
//     // }



//     // const res = await arweave.api.post(`arql`, tribus_list)
//     // return res["data"]
// }


async function filter_owners() {
    const tribuses_list = await getCreatedTribusList();
    console.log(tribuses_list)

    for (tribus_tx of tribuses_list) {
        const tx_status = await arweave.transactions.getStatus(tribus_tx)
        if (tx_status["status"] != 200) {continue}
        const tx_data = await arweave.transactions.get(tribus_tx)
        const owner = tx_data["owner"]
        // console.log(owner)

        tribuses_map.has(owner) ? console.log("already added") : tribuses_map.set(owner, tribus_tx)

    }

    const tribuses_obj = Object.fromEntries(tribuses_map.entries())
    console.log(Object.values(tribuses_obj))
    return Object.values(tribuses_obj)
}

async function get_tribus_obj() {

    if (! window.location.hash.substring(1)) {
        display_posts({
                    id: 'null',
                    name: 'public-square',
                    app : 'PublicSquare'
                })

        return
    }
    const tribusTxs = await filter_owners();
    const tribuses = {};


    for (tx of tribusTxs) {

        const tx_data = await arweave.transactions.get(tx)
        const tags = await tx_data.get('tags')
        const tx_obj = {}
        for (tag of tags) {
            const key = tag.get("name", {decode: true, string: true})
            const value = tag.get("value", {decode: true, string: true})
           

            if (key == 'tribus-id' || key == 'tribus-name' || key == "visibility" ) {

                Object.defineProperty(tx_obj, key, {value: value})

            }
        }

  
        tribuslist.push({

                        "tribus_name": tx_obj["tribus-name"], 
                        "tribus_id" : tx_obj["tribus-id"],
                        "visibility": tx_obj["visibility"]
                        
                        }

                        )

        
        
    }

    const hash = window.location.hash.substring(1);
    const communities = new Map()

    tribuslist.forEach(tribus => {
        communities.set(tribus["tribus_id"], `${tribus["tribus_name"]};${tribus['visibility']}`)
    })

    console.log(communities)
    if (hash) {

        if (communities.has(hash))
            {
    
            display_posts({
                    id: hash,
                    name: (communities.get(hash)).split(';')[0],
                    visibility: (communities.get(hash)).split(';')[1],
                    app : 'decent.land'
                })
            

            } else {
                document.getElementById("tribusName").innerHTML = `tribus not found`
                return
            }

        } else {
            console.log('reached')

            display_posts({
                    id: 'null',
                    name: 'public-square',
                    app : 'PublicSquare'
                })
        
    }

    

}



async function isHolder(address, t_id, visibility) { 

    const data = await readState(arweave, String(t_id));
    console.log(data)
    console.log(data["balances"][address])
    return data["balances"][address] >= visibility
}


async function isArverified(address) {
    const verificationObj = await Arverify(address)

    return verificationObj.verified

}





async function getPostsTxs(app, id, name) {
    console.log(app, id, name)

    const post_type = app == "PublicSquare" ? 
    `{ name: "Type", values: "post"},` :
    `{ name: "action", values: "post"},`;



    const queryObject = {
      query: 
        `query {
  transactions(
    tags: [
        { name: "Content-Type", values: "text/plain" },
        { name: "App-Name", values: "${app}"},
        { name: "tribus-id", values: "${id}"},
        { name: "tribus-name", values: "${name}"},
        ${post_type}
      
        ]

    first: 1000000

  ) {
    edges {
      node {
        id
      }
    }
  }
}
`,
    };
    const response = await fetch("https://arweave.net/graphql", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryObject),
    });

    const json = await response.json();
    const data_arr = [];

    const res_arr = json["data"]["transactions"]["edges"];

    for (element of res_arr) {
        const tx_obj = Object.values(element);
        const tx_id = (Object.values(tx_obj[0]));
        data_arr.push(tx_id[0])
    }

    return(data_arr)
};



async function getCreatedTribusList() {
 
    const queryObject = {
      query: 
        `query {
  transactions(
    tags: [
        { name: "Content-Type", values: "application/json" },
        { name: "App-Name", values: "decent.land"},
        { name: "action", values: "createTribus"},
        { name: "version", values: "mainnet"}
      
        ]

    first: 1000000

  ) {
    edges {
      node {
        id
      }
    }
  }
}
`,
    };

    const response = await fetch("https://arweave.net/graphql", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryObject),
    });

    const json = await response.json();
    console.log(json)
    const data_arr = [];

    const res_arr = json["data"]["transactions"]["edges"];

    for (element of res_arr) {
        const tx_obj = Object.values(element);
        const tx_id = (Object.values(tx_obj[0]));
        data_arr.push(tx_id[0])
    }

    return(data_arr)
}



async function getUserProfile(address) {
 
    const queryObject = {
      query: 
        `query {
  transactions(
    tags: [
        { name: "Content-Type", values: "application/json" },
        { name: "App-Name", values: "decent.land"},
        { name: "action", values: "signup"},
        { name: "version", values: "0.0.1"}


      
    ]

    first: 1000000
    owners:["${address}"]

  ) {
    edges {
      node {
        id
      }
    }
  }
}
`,
    };
    const response = await fetch("https://arweave.net/graphql", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryObject),
    });

    const json = await response.json();
    console.log(json)
    const data_arr = [];

    const res_arr = json["data"]["transactions"]["edges"];

    for (element of res_arr) {
        const tx_obj = Object.values(element);
        const tx_id = (Object.values(tx_obj[0]));
        data_arr.push(tx_id[0])
    }

    return(data_arr)
}



 get_tribus_obj()