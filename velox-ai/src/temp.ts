import { orgConfig } from './nillionOrgConfig'
import { SecretVaultWrapper } from './wrapper'

const SCHEMA_ID = process.env.SCHEMA_ID;



async function get_data() {
    const collection = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials,
        SCHEMA_ID
    );
    const decryptedCollectionData = await collection.readFromNodes({});
    console.log(
        'Most recent records',
        decryptedCollectionData
    );
    return decryptedCollectionData
}
