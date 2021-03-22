// a script to fetch & display the 
// registered Tribus(es) on 
// DecentLand social network protocol


const arweave = Arweave.init();
const readState = smartweave.readContract;
const tribuses_map = new Map();
// const tribuses_objj = {};
const tribuslist = []



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
        // console.log(owner)

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
            console.log(key, value)

            if (key == 'tribus-id' || key == 'tribus-name' || key == "visibility" || key == "entry" ) {

                Object.defineProperty(tx_obj, key, {value: value})

            }
        }

  
        tribuslist.push({

                        "tribus-name": tx_obj["tribus-name"], 
                        "tribus-id" : tx_obj["tribus-id"],
                        "entry": tx_obj["entry"],
                        "visibility": tx_obj["visibility"],
                        "ticker": await get_ticker(tx_obj["tribus-id"])
                        }

                        )

        document.getElementById('list').innerHTML += `<br><div class="box-newer box-talk box-media">
        <div style="display:inline-block;vertical-align:top;">
        <center><img src="https://arweave.net/${await get_logo(tx_obj["tribus-id"])}" style='max-width: 100px; max-height: 100px'></center>
        </div>

    
      <div style="display:inline-block;">
      <h3>${tx_obj["tribus-name"]}</h3>
    <p><b>Tribus ID:</b> <a href='https://arweave.net/7skTfMpgS-SZ6cOa6Bs7T3KNDqoSg80awIgypFX0hz0/#${tx_obj["tribus-id"]}'>${tx_obj["tribus-id"]}</a></p>
    <p><b>membership entry:</b> ${tx_obj["entry"]} | <b>post visibility:</b> ${tx_obj["visibility"]}  <b>${await get_ticker(tx_obj["tribus-id"])}</b></p>
      </div>
    

  </div><br>`
        
        
    }
    
  
}
// get_ticker(t_id) & get_logo(t_id) are deprecated
// async function get_ticker(t_id) {
//     const community_xyz = "https://cache.community.xyz/contract/"
//     const res = await fetch(`${community_xyz}${t_id}`)
//     const psc_data = await res.json()
//     return psc_data["ticker"]
// }

// async function get_logo(t_id) {

//     const community_xyz = "https://cache.community.xyz/contract/"
//     const res = await fetch(`${community_xyz}${t_id}`)
//     const psc_data = await res.json()
//     let logo = psc_data["settings"][5][1]

//     if (logo) {
//       return logo
//     } else {
// //       custom logo
//       return 'RUaij2IDIpPVjhfcb4LnW8RIClr_gFTzwxovFfPoXxg'
//     }

// }

async function get_ticker(t_id) {

  const data = await readState(arweave, t_id);
  const ticker = data["ticker"];

  return ticker
};

async function get_logo(t_id) {

  const data = await readState(arweave, t_id);
  console.log(data)
  const logo_id = data["settings"][5][1];

  if (!logo_id) {
    return 'RUaij2IDIpPVjhfcb4LnW8RIClr_gFTzwxovFfPoXxg'
  };

  return logo_id

};
// remove Tribus containers when #href != 'list'
window.addEventListener('hashchange', () => {
  console.log('hash changed')
    if(window.location.hash) {
      var hash = window.location.hash.substring(1);
      console.log(hash)

      if (hash == 'list') {
       
        
        document.getElementById('list').style.display = ''
      } else {
        console.log(hash)
        document.getElementById('list').style.display = 'none'
      }

    } else {
      console.log("no href")
    }
      

})

