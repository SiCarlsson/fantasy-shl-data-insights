// SHL Website: https://www.shl.se/api/sports-v2/game-schedule
// Fetches and saves game schedule to bronze.shl_game_schedule
// Defaults to current season, SHL series, and regular game type if not provided
// Note: This is an undocumented API and may change without notice

import axios from "axios";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);

		let seasonUuid = searchParams.get("seasonUuid");
		if (!seasonUuid) {
			const result = await query<{ season_uuid: string }>(
				"SELECT season_uuid FROM reference.seasons WHERE is_current = true LIMIT 1",
			);
			if (result.length === 0) {
				return NextResponse.json(
					{ error: "No current season found in database. Run /api/reference/sync first." },
					{ status: 400 },
				);
			}
			seasonUuid = result[0].season_uuid;
		}

		let seriesUuid = searchParams.get("seriesUuid");
		if (!seriesUuid) {
			const result = await query<{ series_uuid: string }>(
				"SELECT series_uuid FROM reference.series WHERE code = 'SHL' LIMIT 1",
			);
			if (result.length === 0) {
				return NextResponse.json(
					{ error: "No SHL series found in database. Run /api/reference/sync first." },
					{ status: 400 },
				);
			}
			seriesUuid = result[0].series_uuid;
		}

		let gameTypeUuid = searchParams.get("gameTypeUuid");
		if (!gameTypeUuid) {
			const result = await query<{ game_type_uuid: string }>(
				"SELECT game_type_uuid FROM reference.game_types WHERE code = 'regular' LIMIT 1",
			);
			if (result.length === 0) {
				return NextResponse.json(
					{ error: "No regular game type found in database. Run /api/reference/sync first." },
					{ status: 400 },
				);
			}
			gameTypeUuid = result[0].game_type_uuid;
		}

		const response = await axios.get(
			`https://www.shl.se/api/sports-v2/game-schedule`,
			{
				params: {
					seasonUuid,
					seriesUuid,
					gameTypeUuid,
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

		await query(
			`INSERT INTO bronze.shl_game_schedule (season_uuid, raw_data)
			 VALUES ($1, $2)
			 ON CONFLICT (season_uuid) 
			 DO UPDATE SET raw_data = EXCLUDED.raw_data, updated_at = NOW()`,
			[seasonUuid, JSON.stringify(data)],
		);

		const gameCount = Array.isArray(data.gameInfo) 
			? data.gameInfo.length 
			: 0;

		return NextResponse.json({
			success: true,
			message: `Fetched and saved ${gameCount} games to bronze.shl_game_schedule`,
			seasonUuid,
			seriesUuid,
			gameTypeUuid,
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
			{
				error: error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 },
		);
	}
}

