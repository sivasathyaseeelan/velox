import { NextResponse } from "next/server";
import { orgConfig } from '../../../velox-ai/src/nillionOrgConfig'
import { SecretVaultWrapper } from '../../../velox-ai/src/wrapper'

export async function GET() {
  try {
    const SCHEMA_ID = "a1fdeb83-9537-456d-a3f8-760574659c78";

    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );

    await collection.init();
    const decryptedCollectionData = await collection.readFromNodes({});

    return NextResponse.json(decryptedCollectionData, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
