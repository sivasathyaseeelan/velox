import { NextResponse } from "next/server";
import { orgConfig } from '../../../velox-ai/src/nillionOrgConfig'
import { SecretVaultWrapper } from '../../../velox-ai/src/wrapper'

export async function GET() {
  try {
    const SCHEMA_ID = "5e032866-6ac7-4858-b2cd-993aceeac290";

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
