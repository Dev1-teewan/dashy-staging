import { pinata } from "../../utils/config";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const uploadData = await pinata.upload.file(file);

    // Convert to a URL
    const url = await pinata.gateways.convert(uploadData.IpfsHash);

    // Return the URL wrapped in an object
    return NextResponse.json({ ipfsUrl: url }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}