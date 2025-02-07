import { NextResponse } from "next/server";
import { orgConfig } from '../../../velox-ai/src/nillionOrgConfig'
import { SecretVaultWrapper } from '../../../velox-ai/src/wrapper'

export async function GET() {
  try {
    const SCHEMA_ID = "99c4db06-beac-4993-8085-64b9f6174dd9";

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
