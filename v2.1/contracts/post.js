// TODO
//  1- test "delete" function which deletes a single post by ID,
// according on the DAO's vote result
// 2- create "timedBan" which "ban" a user for x network blocks 


const USERS_SWC = "RUsVtU-kywFWf63XivMPPM2o3hmP7xRQYdlwEk52paA"
const TRIBUS_SWC = "fRyRiV40kTqz62IGDoK76MmELzB-gV9zcadN7V6fBGM"
const DECENTLAND_SWC = "sew_MAXZIgmyEPzzOTkdAca7SQCL9XTCMfxY3KOE5-M"

export async function handle(state, action) {
    const input = action.input
    const caller = action.caller
    const users = state.users
    const posts = state.posts
    const replies = state.replies

    const usersState = await SmartWeave.contracts.readContractState(USERS_SWC)
    const tribusState = await SmartWeave.contracts.readContractState(TRIBUS_SWC)
    const decentlandState = await SmartWeave.contracts.readContractState(DECENTLAND_SWC)

    if (input.function === "post") {
        const text = input.text
        const tribus = input.tribus


        if (! caller in usersState["users"]) {
            throw new ContractError("You have to signup first")
        }

        if (! tribus in tribusState["tribuses"]) {
            throw new ContractError("Tribus not found")
        }

        const membership = tribusState["tribuses"][tribus]["membership"]
        const visibility = tribusState["tribuses"][tribus]["visibility"]

        // The PSC of the Tribus
        const specifiedTribusState = await SmartWeave.contracts.readContractState(tribus)
        const heldPST = specifiedTribusState["balances"]
        // set 0 held balance for non-holder
        let balance = heldPST[caller] ? heldPST[caller] : 0

        let stakedPST = specifiedTribusState["vault"]
        let staked = stakedPST[caller] ? stakedPST[caller].reduce((accumulator, balance) => accumulator + balance, 0) : 0

        if (staked < membership) {
            throw new ContractError(`You aren't a member, you should stake at least ${membership} of ${specifiedTribusState["ticker"]}`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (typeof text !== "string") {
            throw new ContractError("invalid text type")
        }

        if (text.length > 150) {
            throw new ContractError(`Surpass the post's max length limit`)
        }

        const txID = SmartWeave.transaction.id

        if (! users[caller]) {
            users[caller] = {
                "posts": {

                },

                "replies": {

                }
            }
        }

        users[caller]["posts"][txID] = {
            "tribus": tribus,
            "text": text,
            "date": Date.now(),
            "replies": []
        }

        posts.push(txID)

        return { state }

    }

    if (input.function === "reply") {

        const text = input.text
        const tribus = input.tribus
        const post = input.post


        if (! caller in usersState["users"]) {
            throw new ContractError("You have to signup first")
        }

        if (! tribus in tribusState["tribuses"]) {
            throw new ContractError("Tribus not found")
        }

        const membership = tribusState["tribuses"][tribus]["membership"]

        // The PSC of the Tribus
        const specifiedTribusState = await SmartWeave.contracts.readContractState(tribus)
        const heldPST = specifiedTribusState["balances"]
        // set 0 held balance for non-holder
        let balance = heldPST[caller] ? heldPST[caller] : 0

        let stakedPST = specifiedTribusState["vault"]
        let staked = stakedPST[caller] ? stakedPST[caller].reduce((accumulator, balance) => accumulator + balance, 0) : 0

        if (staked < membership) {
            throw new ContractError(`You aren't a member, you should stake at least ${membership} of ${specifiedTribusState["ticker"]}`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (typeof text !== "string") {
            throw new ContractError("invalid text type")
        }

        if (text.length > 150) {
            throw new ContractError(`Surpass the post's max length limit`)
        }

        if (! posts.includes(post)) {
            throw new ContractError(`post not found`)
        }

        const postTx = await SmartWeave.unsafeClient.transactions.get(post)

        const postTxOwner = postTx["owner"]
        const postTxOwnerToBase64 = await SmartWeave.unsafeClient.wallets.ownerToAddress(postTxOwner)

        if (! users[postTxOwnerToBase64]) {
            throw new ContractError(`Post's owner not found`)
        }

        if (! users[postTxOwnerToBase64]["posts"][post]) {
            throw new ContractError(`Reply to an undefined post`)
        }

        const replyTxID = SmartWeave.transaction.id

        // add the reply TX to the post's owner object
        users[postTxOwnerToBase64]["posts"][post]["replies"].push(replyTxID)

        if (! users[caller]) {
            users[caller] = {
                "posts": {

                },

                "replies": {

                }
            }
        }

        // record the reply object
        users[caller]["replies"][replyTxID] = {
            "text": text,
            "tribus": tribus,
            "thread": post,
            "replyTo": postTxOwner,
            "date": Date.now()
        }

        return { state }
    }

    if (input.function === "delete") {
        const id = input.id
        const type = input.type

        let postID;
        let owner;
        let replyTo;

        if (! posts.includes(id) || ! replies.includes(id)) {
            throw new ContractError(`post not found`)
        }

        if (type !== "post" || type !== "reply") {
            throw new ContractError(`invalid post type`)
        }


        for (let user of users) {
            if (! user[type]) {
                throw new ContractError(`The user doesn't have posted any ${type} yet`)
            }

            if (! id in user[type]) {
                throw new ContractError("post not found")
            } else {
                thread = type === "replies" ? user[type][id]["thread"] : undefined

                if (thread) {
                    replyTo = user[type][id]["replyTo"]
                }
                owner = user
            }
        }

        const tribus = users[owner][type]["tribus"]
        const psc = await SmartWeave.contracts.readContractState(tribus)

        // validate caller membership
        let stakedPST = psc["vault"]
        let staked = stakedPST[caller] ? stakedPST[caller].reduce((accumulator, balance) => accumulator + balance, 0) : 0

        if (staked < membership) {
            throw new ContractError(`You aren't a member, you should stake at least ${membership} of ${psc["ticker"]}`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        // validate deleting post voting
        for (let vote in psc["votes"]) {
            if ( vote["note"].startswith("decentland:") && vote["status"] === "passed") {

                if (vote["nays"] > vote["yays"]) {
                    throw new ContractError(`Vote not accepted`)
                }
                
                postID = vote["note"].slice(vote["note"].indexOf(":")).replace(":", "")
            }
        }

        if (postID !== id) {
            throw new ContractError(`Your attempt is to delete a different post`)
        }

        if (posts.includes(id)) {
            delete users[owner]["posts"][id]
            posts.splice(posts.indexOf(id), 1)
        }

        if (replies.includes(id)) {
            delete users[owner]["replies"][id]
            replies.splice(posts.indexOf(id), 1)

            const replyInThreadIndex = users[replyTo]["posts"][thread]["replies"].indexOf(id)
            users[replyTo]["posts"][thread]["replies"].splice(replyInThreadIndex, 1)
        }

        return { state }

    }

}

