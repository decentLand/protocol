// smartweave contract to create Tribuses
// for Arweave based DAOs. With SWC immutability
// it can prevent on-chain data manipulation (tampering)

//Author(s):
// charmful0x

const DECENTLAND_SWC = "sew_MAXZIgmyEPzzOTkdAca7SQCL9XTCMfxY3KOE5-M"
const USERNAMES_SWC = "RUsVtU-kywFWf63XivMPPM2o3hmP7xRQYdlwEk52paA"

//testnet addresses
//const DECENTLAND_SWC = "OA2AH-uyk6IakJDTQhgUaAf5PWaSGJgWz178C1aYDL4"
//const USERNAMES_SWC = "Pt9DTwf3aZcxooq7Eq7XlkVRiIQDt3JJS1LV9UwoxDE"

export async function handle(state, action) {

    const input = action.input
    const caller = action.caller
    const tribuses = state.tribuses
    const decentlandState = await SmartWeave.contracts.readContractState(DECENTLAND_SWC)
    const usernameSystem = await SmartWeave.contracts.readContractState(USERNAMES_SWC)


    if (input.function === "createTribus") {
        const tribusName = input.name
        const tribusID = input.id
        const membership = input.membership
        const visibility = input.visibility
        const description = input.description

        const tagsMap = new Map()

        if ( caller.length !== 43 || typeof caller !== "string") {
            throw new ContractError(`invalid Arweave address`)
        }

        if (tribusID in tribuses) {
            throw new ContractError(`${tribusID} is already registered, you can update it`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You should have a balance greater than zero of DLT tokens`)
        }

        if (! caller in usernameSystem["users"]) {
            throw new ContractError(`you should create an account on decent.land`)
        }

        if (tribusID.length !== 43 || typeof tribusID !== "string") {
            throw new ContractError(`invalid PSC TX`)
        }

        if (typeof tribusName !== "string" || tribusName.length > 25 || tribusName.length < 3) {
            throw new ContractError(`invalid tribusname type`)
        }

        if (typeof description !== "string" || description.length > 200) {
            throw new ContractError(`invalid description`)
        }

        if (typeof visibility !== "number" || typeof membership !== "number") {
            throw new ContractError(`invalid entry type`)
        }

        if (!Number.isInteger(visibility) || !Number.isInteger(membership)) {
            throw new ContractError(`invalid entry type`)
        }

        const psc_tx = await SmartWeave.unsafeClient.transactions.get(tribusID)
        const tags = psc_tx.get("tags")

        const pscTxOwner = psc_tx["owner"]
        const pscTxOwnerToBase64 = await SmartWeave.unsafeClient.wallets.ownerToAddress(pscTxOwner)

        for (let tag of tags) {
        let key = tag.get("name", {decode: true, string: true});
        let value = tag.get("value", {decode: true, string: true});
        tagsMap.set(key, value)
        }


        if (caller !== pscTxOwnerToBase64) {
            throw new ContractError(`only ${tribusID} owner can create a Tribus for it`)
        }
        if (! tagsMap.has("Contract-Src")) {
            throw new ContractError(`invalid PSC TX`)
        }

        if (tagsMap.get("Contract-Src") !== "ngMml4jmlxu0umpiQCsHgPX2pb_Yz6YDB8f7G6j-tpI") {
            throw new ContractError(`invalid cXYZ PSC`)
        }

        if (! tagsMap.has("Action")) {
            throw new ContractError(`invalid PSC TX`)
        }

        if (tagsMap.get("Action") !== "CreateCommunity") {
            throw new ContractError(`invalid cXYZ PSC`)
        }

        if (! tagsMap.has("Service")) {
            throw new ContractError(`invalid PSC TX`)
        }

        if (tagsMap.get("Service") !== "CommunityXYZ") {
            throw new ContractError(`invalid cXYZ PSC`)
        }

        if (! tagsMap.has("Content-Type")) {
            throw new ContractError(`invalid PSC TX`)
        }

        if (tagsMap.get("Content-Type") !== "application/json") {
            throw new ContractError(`invalid cXYZ PSC`)
        }
        
        const creationTX = SmartWeave.transaction.id
        
        tribuses[tribusID] = {
            "tribusName": tribusName,
            "membership": membership,
            "visibility": visibility,
            "description": description,
            "tribusLogs": [creationTX]
        }

        return { state }

    }

    if (input.function === "updateTribus") {

        const tribusName = input.name
        const tribusID = input.id
        const membership = input.membership
        const visibility = input.visibility
        const description = input.description

        const tagsMap = new Map()

        if ( caller.length !== 43 || typeof caller !== "string") {
            throw new ContractError(`invalid Arweave address`)
        }

        if (! tribusID in tribuses) {
            throw new ContractError(`${tribusID} not recognised, please create the tribus first`)
        }

        if (! decentlandState["balances"][caller]) {
            throw new ContractError(`You should have a balance greater than zero of DLT tokens`)
        }

        if (! caller in usernameSystem["users"]) {
            throw new ContractError(`you should create an account on decent.land`)
        }

        if (tribusID.length !== 43 || typeof tribusID !== "string") {
            throw new ContractError(`invalid PSC TX`)
        }

        if (typeof tribusName !== "string" || tribusName.length > 25 || tribusName.length < 3) {
            throw new ContractError(`invalid tribusname type`)
        }

        if (typeof description !== "string" || description.length > 200) {
            throw new ContractError(`invalid description`)
        }

        if (typeof visibility !== "number" || typeof membership !== "number") {
            throw new ContractError(`invalid entry type`)
        }

        if (!Number.isInteger(visibility) || !Number.isInteger(membership)) {
            throw new ContractError(`invalid entry type`)
        }

        const psc_tx = await SmartWeave.unsafeClient.transactions.get(tribusID)
        const pscTxOwner = psc_tx["owner"]
        const pscTxOwnerToBase64 = await SmartWeave.unsafeClient.wallets.ownerToAddress(pscTxOwner)


        if (caller !== pscTxOwnerToBase64) {
            throw new ContractError(`only ${tribusID} owner can update it`)
        }
        
        const updateTX = SmartWeave.transaction.id
        // tribusID is constant value
        tribuses[tribusID]["tribusName"] = tribusName
        tribuses[tribusID]["membership"] = membership
        tribuses[tribusID]["visibility"] = visibility
        tribuses[tribusID]["description"] = description
        tribuses[tribusID]["tribusLogs"].push(updateTX)
        

        return { state }
    }
    
    throw new ContractError(`unknown function supplied: ${input.function}`)
}
