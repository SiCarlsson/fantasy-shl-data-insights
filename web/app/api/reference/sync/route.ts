// SHL Website: https://www.shl.se/game-schedule
// Fetches and syncs reference data (seasons, series, game types) from SHL API
// Run this periodically to keep reference data up to date

import axios from "axios";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

interface SHLSeason {
	uuid: string;
	code: string;
	names: Array<{ language: string; translation: string }>;
}

interface SHLSeries {
	uuid: string;
	code: string;
	names: Array<{ language: string; translation: string }>;
}

interface SHLGameType {
	uuid: string;
	code: string;
	names: Array<{ language: string; translation: string }>;
}

interface SHLFilterResponse {
	season: SHLSeason[];
	series: SHLSeries[];
	gameType: SHLGameType[];
	defaultSsgtFilter: {
		season: string;
		series: string;
		gameType: string;
	};
}

export async function POST() {
	try {
		const response = await axios.get<SHLFilterResponse>(
			"https://www.shl.se/api/sports-v2/season-series-game-types-filter",
			{ timeout: 10000 },
		);

		const { season, series, gameType, defaultSsgtFilter } = response.data;

		for (const s of season) {
			const name =
				s.names.find((n) => n.language === "sv")?.translation || s.code;
			const isCurrent = s.uuid === defaultSsgtFilter.season;

			await query(
				`INSERT INTO reference.seasons (season_uuid, code, name, is_current)
				 VALUES ($1, $2, $3, $4)
				 ON CONFLICT (season_uuid)
				 DO UPDATE SET code = $2, name = $3, is_current = $4, updated_at = NOW()`,
				[s.uuid, s.code, name, isCurrent],
			);
		}

		for (const s of series) {
			const name =
				s.names.find((n) => n.language === "sv")?.translation ||
				s.names.find((n) => n.language === "en")?.translation ||
				s.code;

			await query(
				`INSERT INTO reference.series (series_uuid, code, name)
				 VALUES ($1, $2, $3)
				 ON CONFLICT (series_uuid) 
				 DO UPDATE SET code = $2, name = $3, updated_at = NOW()`,
				[s.uuid, s.code, name],
			);
		}

		for (const gt of gameType) {
			const name =
				gt.names.find((n) => n.language === "sv")?.translation ||
				gt.names.find((n) => n.language === "en")?.translation ||
				gt.code;

			await query(
				`INSERT INTO reference.game_types (game_type_uuid, code, name)
				 VALUES ($1, $2, $3)
				 ON CONFLICT (game_type_uuid) 
				 DO UPDATE SET code = $2, name = $3, updated_at = NOW()`,
				[gt.uuid, gt.code, name],
			);
		}

		return NextResponse.json({
			success: true,
			message: "Reference data synced successfully",
			stats: {
				seasons: season.length,
				series: series.length,
				gameTypes: gameType.length,
				currentSeason:
					season
						.find((s) => s.uuid === defaultSsgtFilter.season)
						?.names.find((n) => n.language === "sv")?.translation || "Unknown",
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return NextResponse.json(
				{
					error: `Failed to fetch reference data from SHL API: ${error.message}`,
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
