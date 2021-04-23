const DECENTLAND_SWC = "sew_MAXZIgmyEPzzOTkdAca7SQCL9XTCMfxY3KOE5-M"



export async function handle(state, action) {

  const input = action.input
  const caller = action.caller
  const users = state.users
  const actionOn = input.actionOn
  const decentlandState = await SmartWeave.contracts.readContractState(DECENTLAND_SWC)

  if (input.function === "follow") {

    if ( typeof actionOn !== "string" || actionOn.length !== 43 ) {
      throw new ContractError(`${actionOn} is an invalid Arweave address`)
    }

    if ( ! decentlandState["balances"][caller] ) {
      throw new ContractError(`You need to have a balance greater than zero of DLT token`)
    }

    if ( actionOn === caller ) {
      throw new ContractError(`You can't follow yourself`)
    }
    if ( users[caller]["block_list"].includes(actionOn) ) {
      throw new ContractError(`You have to unblock ${actionOn}`)
    }

    if ( users[actionOn]["block_list"].includes(caller) ) {
      throw new ContractError(`You have been blocked by ${caller}`)
    }
    
    // if the caller has been blocked by actionOn, throw err 
   if ( caller in users ) {
     if ( users[caller]["block_list"].includes(actionOn) ) {
      throw new ContractError(`You have to unblock ${actionOn}`)
    }
    // if actionOn is blocked by caller, throw err
    if ( users[actionOn]["block_list"].includes(caller) ) {
      throw new ContractError(`You have been blocked by ${caller}`)
    }
   }
    
    if ( caller in users ) {
      if ( (users[caller]["followings"]).includes(actionOn) ) {
        throw new ContractError(`You already follow ${actionOn}`)
      } else {
        (users[caller]["followings"]).push(actionOn)
        if (users[actionOn]) {
          (users[actionOn]["followers"]).push(caller)
        } else {
          users[actionOn] = {
            "followings": [],
            "followers": [caller],
            "block_list": [],
            "friendzone": {}
          }
        }
      }
    } else {
      if ( ! users[actionOn] ) {
        users[actionOn] = {
          "followings": [],
          "followers": [caller],
          "block_list": [],
          "friendzone": {}
        }
      }

      users[caller] = {
        "followings": [actionOn],
        "followers": [],
        "block_list": [],
        "friendzone": {}
      }

    }

    return { state }
  }

  if ( input.function === "unfollow" ) {

    if ( typeof input.actionOn !== "string" || actionOn.length !== 43 ) {
      throw new ContractError(`${actionOn} is an invalid Arweave address`)
    }

    if ( ! decentlandState["balances"][caller] ) {
      throw new ContractError(`You need to have a balance greater than zero of DLT token`)
    }

    if ( actionOn === caller ) {
      throw new ContractError(`You can't perform this action on your own wallet address`)
    }

    if ( !users[actionOn] ) {
      throw new ContractError(`user not recorded`)
    }

    if ( ! (users[caller]["followings"]).includes(actionOn) ) {
      throw new ContractError(`${actionOn} not found in ${caller} followings list`)
    }

    const indexOfActionOn = users[caller]["followings"].indexOf(actionOn)
    // remove the actionOn wallet address from caller's following list
    users[caller]["followings"].splice(indexOfActionOn, 1)

    const indexOfCaller = users[actionOn]["followers"].indexOf(caller)
    // remove caller's wallet address from actionOn followers list
    users[actionOn]["followers"].splice(indexOfCaller, 1)

    return { state }
  }
  
  if ( input.function === "block" ) {

    if ( typeof actionOn !== "string" || actionOn.length !== 43 ) {
      throw new ContractError(`${actionOn} is an invalid Arweave address`)
    }

    if ( ! decentlandState["balances"][caller] ) {
      throw new ContractError(`You need to have a balance greater than zero of DLT token`)
    }

    if ( actionOn === caller ) {
      throw new ContractError(`You can't perform this action on your own wallet address`)
    }

    if (! users[caller] ) {
      throw new ContractError(`${caller} is unrecognized`)
    }

    if (! users[actionOn] ) {
      throw new ContractError(`user not found`)
    }

    if ( users[caller]["block_list"].includes(actionOn) ) {
      throw new ContractError(`${actionOn} has been already blocked`)
    }
    // if it exist, remove the actionOn address from caller's followers array
    if ( users[caller]["followers"].includes(actionOn) ) {
      const indexOfBlocked = users[caller]["followers"].indexOf(actionOn)
      users[caller]["followers"].splice(indexOfBlocked, 1)
      // remove caller from actionOn's followings list
      const indexOfCaller = users[actionOn]["followings"].indexOf(caller)
      users[actionOn]["followings"].splice(indexOfCaller, 1)
    }
    // if it exist, remove the actionOn address from caller's followings array
    if ( users[caller]["followings"].includes(actionOn) ) {
      const indexOfBlocked = users[caller]["followings"].indexOf(actionOn)
      users[caller]["followings"].splice(indexOfBlocked, 1)
      // remove caller from actionOn's followers list
      const indexOfCaller = users[actionOn]["followers"].indexOf(caller)
      users[actionOn]["followers"].splice(indexOfCaller, 1) 
    }
    //  if exist, remove actionOn from caller's friendzone object
    if ( actionOn in users[caller]["friendzone"] ) {
      delete users[caller]["friendzone"][actionOn]
    }
    //  if exist, remove caller from actionOn's friendzone object
    if ( caller in users[actionOn]["friendzone"] ) {
      delete users[actionOn]["friendzone"][caller]
    }
    // append actionOn to caller's block_list
    users[caller]["block_list"].push(actionOn)

    return { state }

  }
  
  if ( input.function === "unblock" ) {

    if ( typeof actionOn !== "string" || actionOn.length !== 43 ) {
      throw new ContractError(`${actionOn} is an invalid Arweave address`)
    }

    if ( ! decentlandState["balances"][caller] ) {
      throw new ContractError(`You need to have a balance greater than zero of DLT token`)
    }

    if ( actionOn === caller ) {
      throw new ContractError(`You can't perform this action on your own wallet address`)
    }

    if (! users[caller] ) {
      throw new ContractError(`${caller} is unrecognized`)
    }

    if (! users[actionOn] ) {
      throw new ContractError(`user not found`)
    }

    if (! users[caller]["block_list"].includes(actionOn) ) {
      throw new ContractError(`${actionOn} is not blocked`)
    }
    // additional security check (it shouldn't evaluate to true)
    if (users[caller]["followers"].includes(actionOn) || users[caller]["followings"].includes(actionOn) || 
      users[actionOn]["followers"].includes(caller) || users[actionOn]["followings"].includes(caller) ) {
      throw new ContractError(`something goes wrong`)
    }
    // remove actionOn from caller's block_list
    const indexOfActionOn = users[caller]["block_list"].indexOf(actionOn)
    users[caller]["block_list"].splice(indexOfActionOn, 1)

    return { state }

  }
}
