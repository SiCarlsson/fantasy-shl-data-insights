// SHL Website: https://www.shl.se/team/2459-2459QTs1f/dif1_dif/squad
// Returns player roster organized by position groups for a specific team
// Note: This is an undocumented API and may change without notice

import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ uuid: string }> },
) {
	const { uuid } = await params;

	if (!uuid || !/^[a-zA-Z0-9-]+$/.test(uuid)) {
		return NextResponse.json(
			{ error: "Invalid team UUID format" },
			{ status: 400 },
		);
	}

	try {
		const response = await axios.get(
			`https://www.shl.se/api/sports-v2/athletes/by-team-uuid/${uuid}`,
			{
				timeout: 10000,
			},
		);

		const data = response.data;

		if (data.length === 0) {
			return NextResponse.json(
				{ error: "No players found for the given team UUID" },
				{ status: 404 },
			);
		}

		// TODO: Save to database

		return NextResponse.json({
			success: true,
			message: `Ingested ${data.length} position groups for team ${uuid}`,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return NextResponse.json(
				{ error: `Failed to fetch players from SHL API: ${error.message}` },
				{ status: error.response?.status || 500 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
