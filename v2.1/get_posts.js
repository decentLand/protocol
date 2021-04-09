const arweave = Arweave.init({
    host: 'arweave.net',
    protocol: 'https'
});

const readState = smartweave.readContract;
const Arverify = arverify.getVerification;
const posts = [];
let tribuslist = [];
let tribuses_map = new Map();

async function getNetwork() {
    const network_obj = await arweave.network.getInfo();
    const version = network_obj["network"];
    const height = network_obj["height"];
    const peers = network_obj["peers"];

    document.getElementById("network").innerHTML = 
    `network: ${version} | height: ${height} | peers: ${peers}`
}

getNetwork()


async function get_profile(address) {

     const res = await getUserProfile(address);
     
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

    const posts_list = await getPostsTxs(app, id, name)
    const cache_data = await getCacheData()
    const cache = new Map(Object.entries(JSON.parse(cache_data)))

    document.getElementById("tribusName").innerHTML = `Tribus: ${name}`;
    

    for (post of posts_list) {
        if (cache.has(post)) {
            const data = cache.get(post);
            const usernameAndCheckmark = await isArverified(data["user-id"]) ?
        `<div class="user-fullname">${data["username"] }  <div class="check"></div></div>` :
        `<div class="user-fullname">${data["username"]}</div>`

        document.getElementById("content").innerHTML += 

        `<div class="tweet">
          <div class="user">
            <img src="https://arweave.net/${data["pfp"]}" alt="pfp" class="user-avatar">
          ${usernameAndCheckmark}
        <div class="user-username">${data["user-id"]} </div>
          </div>
        <div class="tweet-text">
            ${data["text"]}
        </div>
        <time class="tweet-time">
            post id: ${post}
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





        } else {

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

    
        }
    }
    


    
        
    
}



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
};

async function get_tribus_obj() {
    const url_hash = window.location.hash.substring(1);

    if (! url_hash) {

        display_posts({
                    id: 'null',
                    name: 'public-square',
                    app : 'PublicSquare'
                })

        return
    };

    // retrieve corresponding Tribus data
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
        };

  
        tribuslist.push( {

                        "tribus_name": tx_obj["tribus-name"], 
                        "tribus_id" : tx_obj["tribus-id"],
                        "visibility": tx_obj["visibility"]
                        
                        }

                            );

        
        
    };

    const communities = new Map()

    tribuslist.forEach(tribus => {
        communities.set(tribus["tribus_id"], `${tribus["tribus_name"]};${tribus['visibility']}`)
    });


    if (url_hash) {

        if ( communities.has(url_hash) )
            {
    
            display_posts({
                    id: url_hash,
                    name: (communities.get(url_hash)).split(';')[0],
                    visibility: (communities.get(url_hash)).split(';')[1],
                    app : 'decent.land'
                });
            

            } else {
                document.getElementById("tribusName").innerHTML = `tribus not found`
                return
            }

        } 
};



async function isHolder(address, t_id, visibility) { 

    const data = await readState(arweave, String(t_id));
    console.log(data)
    console.log(data["balances"][address])
    return data["balances"][address] >= visibility
}

// blue checkmark is given for Arverified addresses
async function isArverified(address) {
    const verificationObj = await Arverify(address)

    return verificationObj.verified

};





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

    return data_arr
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

    return data_arr
};



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

    const data_arr = [];

    const res_arr = json["data"]["transactions"]["edges"];

    for (element of res_arr) {
        const tx_obj = Object.values(element);
        const tx_id = (Object.values(tx_obj[0]));
        data_arr.push(tx_id[0])
    }

    return data_arr
};

// 
// 
// 
// 
// 
// 

// async function getCacheData() {
//     const archiver_addr = "rB86LBc5uSm68ZGh5v2sdiM-8r4uFOZ35VZwBvnesqo"
//     const last_tx = await arweave.wallets.getLastTransactionID(archiver_addr)
//     console.log(last_tx)
//     const last_cache_data = await arweave.transactions.getData(last_tx, {decode: true, string: true});

//     const cache_object = JSON.parse(last_cache_data);
//     const cache = new Map( Object.entries(cache_object) );

//     return cache

    
// };

async function getCacheData() {
    const archiver_addr = "rB86LBc5uSm68ZGh5v2sdiM-8r4uFOZ35VZwBvnesqo"
    const last_tx = await arweave.wallets.getLastTransactionID(archiver_addr)

    const last_cache_data = await arweave.transactions.getData(last_tx, {decode: true, string: true});

    const cache_object = JSON.parse(last_cache_data);
    const cache = new Map( Object.entries(cache_object) );


    const hash = window.location.hash.substring(1);
    if (hash) {
        if ( cache.has(hash) ) {
            const data =  cache.get(hash)
            return await arweave.transactions.getData(data, {decode: true, string: true})
        }
    } else {
        const data =  cache.get("null");
        return await arweave.transactions.getData(data, {decode: true, string: true})
    }

    
};

 get_tribus_obj()

