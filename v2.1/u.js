/*
a script to display user's profile data
from the url full path: `#user_id`

Author: charmful0x
*/

const arweave = Arweave.init({
    host: "arweave.net",
    protocol: "https",

});

const readState = smartweave.readContract;
const Arverify = arverify.getVerification;


const userAddress = window.location.hash.substring(1);
const u_username = document.getElementById("username")
const u_bio = document.getElementById("bio");
const u_id = document.getElementById("user_id");
const u_pfp = document.getElementById("pfp");
const u_joinedAt = document.getElementById("joined");
const u_posts = document.getElementById("posts_count");
const u_balance = document.getElementById("balance");
const u_postsObj = document.getElementById("posts");
const u_followers = document.getElementById("followers");
const u_followings = document.getElementById("followings");


const monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


function timestampToDate(unix){
    const date = new Date(unix);
    let day = date.getDate();
    const month = monthList[date.getMonth()]
    const year = date.getFullYear()

    if ( String(day).length == 1 ) {
        day = 0 + String(day)
    }

    return `${month} ${day} ${year}`
};


async function parseProfileData(address) {

    const profileObject = await profileHistory(address)

    u_username.innerHTML = `@${profileObject["username"]}`
    u_bio.innerHTML = `<i>" ${profileObject["bio"]} "</i>`;
    u_id.innerHTML = `${profileObject["user_id"]}`
    u_id.href = `https://viewblock.io/arweave/address/${profileObject["user_id"]}`
    u_pfp.src = `https://arweave.net/${profileObject["pfp"]}`;
    u_joinedAt.innerHTML = (timestampToDate(profileObject["registration_unix_epoch"]))
    u_posts.innerHTML = `~ ${ await postsCount(userAddress) }`;
    u_balance.innerHTML = (await balanceOf(userAddress));
//     display user's posts (PublicSquare posts only)
    await parsePosts(userAddress)
    
};


async function profileHistory(address) {

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
    };
  
    const profile_his = [];

    if (data_arr.length > 0) {

        for (tx of data_arr){

            const registration_data =  await arweave.transactions.getData(tx,
            {
            decode: true, string: true
            });

            profile_his.push( JSON.parse(registration_data) );
        }

        
        return profile_his[0];

        } else {
            return {
                username : `guest_${address.slice(0, 7)}`,
                pfp: "78WdrVhNZ2i_KbimqcV4j-drX04HJr3E6UyD7xWc84Q",
                bio: " a random Arweaver",
                user_id : address

                }
            }

    };


async function postsCount(address) {
     const queryObject = {
      query: 
        `query {
  transactions(
    tags: [
        { name: "Content-Type", values: "text/plain" },
        { name: "user-id", values: "${address}"}      
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
    const res_arr = json["data"]["transactions"]["edges"];

    return res_arr.length

};


async function balanceOf(address) { 
    const decentlandSrc = "sew_MAXZIgmyEPzzOTkdAca7SQCL9XTCMfxY3KOE5-M"
    const data = await readState(arweave, decentlandSrc);

    const expected_balance = data["balances"][address]
    const balance = expected_balance ? expected_balance : 0

    return balance
};

async function isArverified(address) {
    
    const verificationObj = await Arverify(address)
    return verificationObj.verified

};

async function getCacheData() {
    const archiver_addr = "rB86LBc5uSm68ZGh5v2sdiM-8r4uFOZ35VZwBvnesqo"
    const last_tx = await arweave.wallets.getLastTransactionID(archiver_addr)

    const last_cache_data = await arweave.transactions.getData(last_tx, {decode: true, string: true});

    const cache_object = JSON.parse(last_cache_data);
    const cache = new Map( Object.entries(cache_object) );
    const data =  cache.get("null");

    return await arweave.transactions.getData(data, {decode: true, string: true})
};

async function getPspostsOf(address) {

    const publicSquarePosts = await getCacheData();
    const dataObj = JSON.parse(publicSquarePosts);
    const postsArr = (Object.values(dataObj))
    const data = postsArr.filter(post => post["user-id"] == address)

    return data
};

async function parsePosts(address) {
    const posts = await getPspostsOf(address);

    for (let post of posts) {

        const usernameAndCheckmark = await isArverified(post["user-id"]) ?
        `<div class="user-fullname">${post["username"] }  <div class="check"></div></div>` :
        `<div class="user-fullname">${post["username"]}</div>`;


        u_postsObj.innerHTML += 
            `<div class="tweet">
          <div class="user">
            <img src="https://arweave.net/${post["pfp"]}" alt="pfp" class="user-avatar">
            ${usernameAndCheckmark}
            <div class="user-username">${post["user-id"]} </div>
          </div>
        <div class="tweet-text">
            ${post["text"]}
        </div>
        <time class="tweet-time">
            posted on: ${timestampToDate(parseInt(post["unix-epoch"]))}
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

    }


};
// profile metrics are retrieved by reading
// the last state of ./contracts/profileActions.json

// a user's data will start to display only
// after interacting with the SW contract
async function getProfileMetrics(address) {
    const data = await readState(arweave, "sTSWamZ22DNVQolWIc2L-Cfi88dC7YCE3dtXJwAa1kA")

    if (! address in data) {
        return {followers: 0, followings: 0}
    }

    const profileData = data["users"][address]
    const followers = profileData["followers"].length
    const followings = profileData["followings"].length

    return {followers, followings}
}

async function pasreProfileMetrics(address) {
    const data = await getProfileMetrics(address)
    followers.innerHTML = data["followers"]
    followings.innerHTML = data["followings"]
}

pasreProfileMetrics(userAddress)
parseProfileData(userAddress)
