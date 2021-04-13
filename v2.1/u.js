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


async function parseProfileData(address){
    console.log(u_username)
    const profileObject = await profileHistory(address)
    console.log(profileObject)

    u_username.innerHTML = `@${profileObject["username"]}`
    u_bio.innerHTML = `<i>" ${profileObject["bio"]} "</i>`;
    u_id.innerHTML = `${profileObject["user_id"]}`
    u_id.href = `https://viewblock.io/arweave/address/${profileObject["user_id"]}`
    u_pfp.src = `https://arweave.net/${profileObject["pfp"]}`;
    u_joinedAt.innerHTML = (timestampToDate(profileObject["registration_unix_epoch"]))
    u_posts.innerHTML = `~ ${ await postsCount(userAddress) }`;
    u_balance.innerHTML = (await balanceOf(userAddress))
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
                bio: " a random Arweaver"
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


parseProfileData(userAddress)
