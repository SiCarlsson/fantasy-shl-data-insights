// SHL Website: https://www.shl.se/team/2459-2459QTs1f/dif1_dif/squad
// Returns team information including founding year, championships (golds), and finals appearances
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
			`https://www.shl.se/api/sports-v2/teams/${uuid}`,
			{ timeout: 10000 },
		);

		const data = response.data;

		if (!data) {
			return NextResponse.json(
				{ error: "No team information found for the given UUID" },
				{ status: 404 },
			);
		}

		// TODO: Save to database

		return NextResponse.json({
			success: true,
			message: `Fetched team information for ${uuid}`,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return NextResponse.json(
				{ error: `Failed to fetch team info from SHL API: ${error.message}` },
				{ status: error.response?.status || 500 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
