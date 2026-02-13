import { NextResponse } from "next/server";
import { getPeople } from "@/actions/inventory";

export async function GET() {
  const people = await getPeople();
  return NextResponse.json(people);
}
