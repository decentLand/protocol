const DECENTLAND_SWC = "sew_MAXZIgmyEPzzOTkdAca7SQCL9XTCMfxY3KOE5-M"
const DECENTLAND_USER = "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"


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

    if ( users[caller] ) {
      if ( (users[caller]["followings"]).includes(actionOn) ) {
        throw new ContractError(`You already follow ${actionOn}`)
      } else {
        (users[caller]["followings"]).push(actionOn)
        if (users[actionOn]) {
          (users[actionOn]["followers"]).push(caller)
        } else {
          users[actionOn] = {
            "followings": [DECENTLAND_USER],
            "followers": [caller],
            "block_list": [],
            "friendzone": {}
          }
        }
      }
    } else {
      if ( ! users[actionOn] ) {
        users[actionOn] = {
          "followings": [DECENTLAND_USER],
          "followers": [caller],
          "block_list": [],
          "friendzone": {}
        }
      }

      users[caller] = {
        "followings": [DECENTLAND_USER, actionOn],
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
}
