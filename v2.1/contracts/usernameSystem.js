// a smartweave contract that provides
// a multi-token contract model.
// each username represents a unique
// token according to its length and
// alphabetical characters

// Each signup action is equivalent to
// a new username minting

// REQUIREMENTS:
// the caller should be a DLT token holder

//Author(s):
// charmful0x

// NOTE: THIS CONTRACT STILL NOT IMPLEMENTED
// OFFICIALLY. NO PRE-MINTING
const DECENTLAND_SWC = "sew_MAXZIgmyEPzzOTkdAca7SQCL9XTCMfxY3KOE5-M"

export async function handle(state, action){

    const input = action.input
    const caller = action.caller
    const users = state.users
    const availableTokens = state.availableTokens
    const mintedTokens = state.mintedTokens
    const balances = state.balances
    const decentlandState = await SmartWeave.contracts.readContractState(DECENTLAND_SWC)
    const blockHeight = SmartWeave.block.height

    // stages levels:
    // stage ALPHA ends on ~ May 25 2021
    const ALPHA = 714794
    // stage BETA ends on ~ Aug 25 2021
    const BETA = 737994
    // stage GAMMA ends on ~ Dec 25 2021
    const GAMMA = 781194

    if (input.function === "signup") {

        const username = input.username
        const bio = input.bio
        const friendzonePercentage = input.friendzonePercentage
        let pfp = input.pfp
        const tagsMap = new Map()
        let stage;
        let token;
    

        if (caller.length !== 43 || typeof caller !== "string") {
            throw new ContractError(`invalid arweave address`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (caller in users) {
            throw new ContractError(`${caller} is already registered`)
        }

        if (typeof bio !== "string" || bio.length > 75) {
            throw new ContractError(`invalid bio`)
        }

        if (username.length === 0 || typeof username !== "string") {
            throw new ContractError(`invalid username`)
        }
        
        if ( !Number.isInteger(friendzonePercentage)) {
            throw new ContractError(`only integer values allowed`)
        }

        if (friendzonePercentage < 10 || friendzonePercentage > 90) {
            throw new ContractError(`friendzonePercentage should be between 10 and 90`)
        }
        
        // only alphabetical characters are allowed
        for (char of username) {
            if (char.charCodeAt(0) < 97 || char.charCodeAt(0) > 122  ) {
                throw new ContractError(`unsupported character supplied`)
            }
        }
        // validate that the pfpTX is media data TX
        let pfp_tx = await SmartWeave.unsafeClient.transactions.get(pfp)
        let tags = pfp_tx.get("tags")

        for (let tag of tags) {
        let key = tag.get("name", {decode: true, string: true});
        let value = tag.get("value", {decode: true, string: true});
        tagsMap.set(key, value)
        }

        if (! tagsMap.has("Content-Type")) {
            throw new ContractError(`invalid TX. a Data TX is required`)
        }

        if (! tagsMap.get("Content-Type").startsWith("image/")) {
            throw new ContractError(`the data TX should be media MIME`)
        }
        // if pfpTX isn't supplied, set a standard pfp
        if (pfp.length === 0) {
            pfp = "78WdrVhNZ2i_KbimqcV4j-drX04HJr3E6UyD7xWc84Q"
        }

        //  the stage array determine the minimum 
        // username's length 
        if (blockHeight <= ALPHA) {
            stage = [1, 2]
        } else if ( blockHeight > ALPHA && blockHeight <= BETA) {
            stage = [3]
        } else if (blockHeight > BETA && blockHeight <= GAMMA) {
            stage = [4]
        } else {
            stage = [5, 6, 7]
        }

        if (username.length < stage[0]) {
            throw new ContractError(`the username length surpass the stage's limit`)
        }

        switch (username.length) {
            case 1:
                token = "ichi"
                break
            case 2:
                token = "ni"
                break
            case 3:
                token = "san"
                break
            case 4:
                token = "shi"
                break
            case 5:
                token = "go"
                break
            case 6:
                token = "roku"
                break
            case 7:
                token = "shichi"
                break
        }


        if (mintedTokens.includes(username)) {
            throw new ContractError(`${username} is already minted`)
        }

        if (availableTokens[token] === 0) {
            throw new ContractError(`${token} is out of supply, you can check for token trading`)
        }
        // initilize the caller's object
        users[caller] = {
            "tokens": {}
        }

        users[caller]["tokens"][token] = {"usernames": [], "balance": 0}
        users[caller]["tokens"][token]["usernames"].push(username)
        // update the balance of `token` (e.g ichi)
        users[caller]["tokens"][token]["balance"] = users[caller]["tokens"][token]["usernames"].length
        // record the caller's balance in balances object
        balances[token][caller] = 1
        // update the availableTokens amount
        availableTokens[token] -= 1
        // record the token in circulation
        mintedTokens.push(username)
        // assign user's metadata
        users[caller]["currentUsername"] = username
        users[caller]["friendzonePercentage"] = friendzonePercentage
        users[caller]["bio"] = bio
        users[caller]["pfp"] = pfp
        users[caller]["joinedAt"] = Date.now()


        return { state }
    }

    if (input.function === "updateBio") {
        const newBio = input.newBio
        

        if (caller.length !== 43 || typeof caller !== "string") {
            throw new ContractError(`invalid arweave address`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (newBio.length > 75 || typeof newBio !== "string") {
            throw new ContractError(`invalid bio supplied`)
        }

        if (! caller in users) {
            throw new ContractError(`You need to register first`)
        }

        if (users[caller]["bio"] === newBio) {
            throw new ContractError(`old bio and new bio are the same`)
        }

        users[caller]["bio"] = newBio
        users[caller]["lastUpdate"] = Date.now()

        return { state }
    }

    if (input.function === "updatePfp") {
        const newPfp = input.pfpID
        const tagsMap = new Map()

        if (typeof newPfp !== "string" || newPfp.length !== 43) {
            throw new ContractError(`invalid TXID`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (! caller in users) {
            throw new ContractError(`You need to register first`)
        }

        if (newPfp === users[caller]["pfp"]) {
            throw new ContractError(`old pfp and new pfp are the same`)
        }

        let pfp_tx = await SmartWeave.unsafeClient.transactions.get(newPfp)
        let tags = pfp_tx.get("tags")

        for (let tag of tags) {
        let key = tag.get("name", {decode: true, string: true});
        let value = tag.get("value", {decode: true, string: true});
        tagsMap.set(key, value)
        }

        if (! tagsMap.has("Content-Type")) {
            throw new ContractError(`invalid TX. a Data TX is required`)
        }

        if (! tagsMap.get("Content-Type").startsWith("image/")) {
            throw new ContractError(`the data TX should be media MIME`)
        }

        users[caller]["pfp"] = newPfp
        users[caller]["lastUpdate"] = Date.now()

        return { state }

    }
    
    if (input.function === "updateFriendzonePercentage") {
        const newPercentage = input.newPercentage
        if (caller.length !== 43 || typeof caller !== "string") {
            throw new ContractError(`invalid Arweave wallet`)
        }
        
        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (! caller in users) {
            throw new ContractError(`You need to register first`)
        }

        if (! Number.isInteger(newPercentage)) {
            throw new ContractError(`friendzonePercentage should be an integer value`)
        }

        if (newPercentage === users[caller]["friendzonePercentage"]) {
            throw new ContractError(`new value should be different than the old one`)
        }

        if (newPercentage < 10 || newPercentage > 90) {
            throw new ContractError(`friendzonePercentage value should be between 10 and 90 %`)
        }

        users[caller]["friendzonePercentage"] = newPercentage
        return { state }
    }

    if (input.function === "transfer") {
        const to = input.to
        const username = input.username
        let token;

        if (to.length !== 43 || typeof to !== "string") {
            throw new ContractError(`invalid destination address`)
        }

        if (! caller in users) {
            throw new ContractError(`unregistered user`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (username.length < 1 || username.length > 7 || typeof username !== "string") {
            throw new ContractError(`invalid username type`)
        }

        switch (username.length) {
            case 1:
                token = "ichi"
                break
            case 2:
                token = "ni"
                break
            case 3:
                token = "san"
                break
            case 4:
                token = "shi"
                break
            case 5:
                token = "go"
                break
            case 6:
                token = "roku"
                break
            case 7:
                token = "shichi"
                break
        }
        
        if (! token in availableTokens) {
            throw new ContractError(`invalid token type`)
        }

        if (users[caller]["currentUsername"] === username) {
            throw new ContractError(`You can't transfer your current username, you have to switch it`)
        }

        if (! token in users[caller]["tokens"]) {
            throw new ContractError(`You don't own a ${token} token`)
        }

        if (users[caller]["tokens"][token]["balance"] === 0) {
            throw new ContractError(`unsufficient balance`)
        }

        if (! users[caller]["tokens"][token]["usernames"].includes(username)) {
            throw new ContractError(`you don't own ${username}`)
        }

        if (to in users) {
            
           if (! users[to]["tokens"][token]) {
                users[to]["tokens"][token] = {
                    "usernames": [],
                    "balance": 0
                }
            }
            // update `to` balance and state
            users[to]["tokens"][token]["usernames"].push(username)
            // update `to` balance dynamically
            users[to]["tokens"][token]["balance"] = users[to]["tokens"][token]["usernames"].length
            // update balances object
            balances[token][to] = users[to]["tokens"][token]["usernames"].length

            // update `caller` balance of usernames and state
            const indexOfUsername = users[caller]["tokens"][token]["usernames"].indexOf(username)
            // remove the username from `usernames` array
            users[caller]["tokens"][token]["usernames"].splice(indexOfUsername, 1)
            // update caller `balance` of usernames dyncamically
            users[caller]["tokens"][token]["balance"] = users[caller]["tokens"][token]["usernames"].length
            // update `balances` object
            balances[token][caller] = users[caller]["tokens"][token]["usernames"].length

            return { state }
        }

        throw new ContractError(`${to} must be a registered user under decent.land protocol`)
    }

    if (input.function === "switch") {
        const username = input.username
        let token;

        if (caller.length !== 43 || typeof caller !== "string") {
            throw new ContractError(`invalid destination address`)
        }

        if (! caller in users) {
            throw new ContractError(`unregistered user`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (username.length < 1 || username.length > 7 || typeof username !== "string") {
            throw new ContractError(`invalid username supplied`)
        }

        if (username  === users[caller]["currentUsername"]) {
            throw new ContractError(`the new username should be different than the current one`)
        }

        if (! mintedTokens.includes(username)) {
            throw new ContractError(`${username} doesn't exist yet, not minted`)
        }


        switch (username.length) {
            case 1:
                token = "ichi"
                break
            case 2:
                token = "ni"
                break
            case 3:
                token = "san"
                break
            case 4:
                token = "shi"
                break
            case 5:
                token = "go"
                break
            case 6:
                token = "roku"
                break
            case 7:
                token = "shichi"
                break
        }

        if (! users[caller]["tokens"][token]["usernames"].includes(username)) {
            throw new ContractError(`You don't own ${username}`)
        }
        // update the currentUsername (displaying username)
        users[caller]["currentUsername"] = username
        users[caller]["lastUpdate"] = Date.now()

        return { state }
    }
    
    if (input.function === "mint") {
        const username = input.username
        let token
        let stage

        if (caller.length !== 43 || typeof caller !== "string") {
            throw new ContractError(`invalid arweave address`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (! caller in users) {
            throw new ContractError(`you have to signup first`)
        }

        if (users[caller]["hasMinted"]) {
            throw new ContractError(`You already minted an additional username: limit reached`)
        }

        if (mintedTokens.includes(username)) {
            throw new ContractError(`${username} is acquired`)
        }

        if (username.length < 1  || username.length > 7 || typeof username !== "string") {
            throw new ContractError(`invalid username`)
        }
        // only alphabetical characters are allowed
        for (char of username) {
            if (char.charCodeAt(0) < 97 || char.charCodeAt(0) > 122  ) {
                throw new ContractError(`unsupported character supplied`)
            }
        }

        if (blockHeight <= ALPHA) {
            stage = [1, 2]
        } else if ( blockHeight > ALPHA && blockHeight <= BETA) {
            stage = [3]
        } else if (blockHeight > BETA && blockHeight <= GAMMA) {
            stage = [4]
        } else {
            stage = [5, 6, 7]
        }

        if (username.length < stage[0]) {
            throw new ContractError(`the username length surpass the stage's limit`)
        }

        switch (username.length) {
            case 1:
                token = "ichi"
                break
            case 2:
                token = "ni"
                break
            case 3:
                token = "san"
                break
            case 4:
                token = "shi"
                break
            case 5:
                token = "go"
                break
            case 6:
                token = "roku"
                break
            case 7:
                token = "shichi"
                break
        }

        if (availableTokens[token] === 0) {
            throw new ContractError(`${token} is out of supply`)
        }
        
        if (! users[caller]["tokens"][token]) {
            users[caller]["tokens"][token] = {
                "usernames": [],
                "balance": 0
            }
        }
        // record the new username
        users[caller]["tokens"][token]["usernames"].push(username)
        // update the token's balance
        users[caller]["tokens"][token]["balance"] = users[caller]["tokens"][token]["usernames"].length
        // update the balances object
        balances[token][caller] = users[caller]["tokens"][token]["usernames"].length
        // remove token from availableTokens
        availableTokens[token] -= 1
        // minting additional username is only
        // available for once per wallet
        users[caller]["hasMinted"] = true
        mintedTokens.push(username)

        return { state }

    }
    
    if (input.function === "blacklistUserFromPosting") {
        const user = input.user
        const voteID = input.vote
        const days = input.days
        const votes = decentlandState["votes"]

        if (typeof user !== "string" || user.length !== 43) {
            throw new ContractError(`invalid Arweave address`)
        }

        if (!users[user]) {
            throw new ContractError(`${user} not found`)
        }

        if (! users[caller]) {
            throw new ContractError(`You must register in decent.land protocol`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You need to have a balance greater than zero of DLT token`)
        }

        if (votes.length < voteID) {
            throw new ContractError(`invalid vote ID`)
        }


        if (! Number.isInteger(voteID)) {
            throw new ContractError(`invalid ID type`)
        }

        if (! Number.isInteger(days)) {
            throw new ContractError(`days must be integer`)
        }

        // min and max user's blacklisting is equal to min and
        // max DLT locking length, hence user's blacklisting is
        // similar to token's staking
        if ( (days * 720) < decentlandState["settings"][3][1]) {
            throw new ContractError(`blacklisting length too low`)
        }

        if ( (days * 720) > decentlandState["settings"][4][1]) {
            throw new ContractError(`blacklisting length too high`)
        }

        if (blacklist.includes(voteID)) {
            throw new ContractError(`vote having ID ${voteID} has been already executed`)
        }

        const vote = votes[voteID]


        if (vote["status"] === "passed" && vote["type"] === "indicative" && vote["note"].startsWith("decentlandBlacklist:")) {
            const voteContent = vote["note"].split(":")[1]

            if (voteContent === user && users[user]) {
                users[user]["blacklistUntilBlockHeight"] = blockHeight + (720 * days)
                blacklist.push(voteID)
                
                return { state }
            }
        }

        throw new ContractError(`Error occured`)

    }
    throw new ContractError(`unknown function supplied: ${input.function}`)
}

