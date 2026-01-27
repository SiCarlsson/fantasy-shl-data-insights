// SHL Website: https://www.shl.se/api/sports-v2/game-schedule
// Returns game schedule filtered by season, series, game type, location, and played status
// Note: This is an undocumented API and may change without notice

import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	const seasonUuid = searchParams.get("seasonUuid");
	const seriesUuid = searchParams.get("seriesUuid");
	const gameTypeUuid = searchParams.get("gameTypeUuid");
	const gamePlace = searchParams.get("gamePlace") || "all";
	const played = searchParams.get("played") || "all";

	if (!seasonUuid || !seriesUuid || !gameTypeUuid) {
		return NextResponse.json(
			{
				error:
					"Missing required parameters: seasonUuid, seriesUuid, gameTypeUuid",
			},
			{ status: 400 },
		);
	}

	try {
		const response = await axios.get(
			`https://www.shl.se/api/sports-v2/game-schedule`,
			{
				params: {
					seasonUuid,
					seriesUuid,
					gameTypeUuid,
					gamePlace,
					played,
				},
				timeout: 10000,
			},
		);

		const data = response.data;

		if (!data || (Array.isArray(data) && data.length === 0)) {
			return NextResponse.json(
				{ error: "No games found for the given parameters" },
				{ status: 404 },
			);
		}

		// TODO: Save to database

		const gameCount = Array.isArray(data.gameInfo) 
			? data.gameInfo.length 
			: 0;

		return NextResponse.json({
			success: true,
			message: `Fetched ${gameCount} games from schedule`,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return NextResponse.json(
				{
					error: `Failed to fetch game schedule from SHL API: ${error.message}`,
				},
				{ status: error.response?.status || 500 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
