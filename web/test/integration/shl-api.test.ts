// Integration tests for SHL API endpoints
// These tests call the REAL API to verify response structure
// Run with: pnpm test:integration

// @vitest-environment node

import { describe, it, expect } from "vitest";
import axios from "axios";

describe("SHL API Integration Tests", () => {
	it("should return valid structure from season-series-game-types-filter endpoint", async () => {
		const response = await axios.get(
			"https://www.shl.se/api/sports-v2/season-series-game-types-filter",
			{ timeout: 10000 },
		);

		const { season, series, gameType, defaultSsgtFilter } = response.data;

		// Verify arrays exist with data
		expect(season?.length).toBeGreaterThan(0);
		expect(series?.length).toBeGreaterThan(0);
		expect(gameType?.length).toBeGreaterThan(0);

		// Verify critical fields needed for database
		expect(season[0]).toMatchObject({
			uuid: expect.any(String),
			code: expect.any(String),
			names: expect.arrayContaining([
				expect.objectContaining({
					language: expect.any(String),
					translation: expect.any(String),
				}),
			]),
		});

		expect(series[0]).toMatchObject({
			uuid: expect.any(String),
			code: expect.any(String),
			names: expect.any(Array),
		});

		expect(gameType[0]).toMatchObject({
			uuid: expect.any(String),
			code: expect.any(String),
			names: expect.any(Array),
		});

		// Verify defaultSsgtFilter used for current season
		expect(defaultSsgtFilter).toMatchObject({
			season: expect.any(String),
			series: expect.any(String),
			gameType: expect.any(String),
		});
	}, 15000);

	it("should return valid structure from game-schedule endpoint", async () => {
		const filterResponse = await axios.get(
			"https://www.shl.se/api/sports-v2/season-series-game-types-filter",
		);

		const { season, series, gameType } = filterResponse.data.defaultSsgtFilter;

		const response = await axios.get(
			"https://www.shl.se/api/sports-v2/game-schedule",
			{
				params: {
					seasonUuid: season,
					seriesUuid: series,
					gameTypeUuid: gameType,
				},
				timeout: 10000,
			},
		);

		const { gameInfo } = response.data;

		expect(gameInfo?.length).toBeGreaterThan(0);

		// Verify critical game fields
		expect(gameInfo[0]).toMatchObject({
			uuid: expect.any(String),
			startDateTime: expect.any(String),
			state: expect.any(String),
			ssgtUuid: expect.any(String),
			homeTeamInfo: {
				uuid: expect.any(String),
				code: expect.any(String),
				names: expect.any(Object),
				score: expect.any(Number),
			},
			awayTeamInfo: {
				uuid: expect.any(String),
				code: expect.any(String),
				names: expect.any(Object),
				score: expect.any(Number),
			},
			venueInfo: {
				uuid: expect.any(String),
				name: expect.any(String),
			},
			seriesInfo: {
				uuid: expect.any(String),
				code: expect.any(String),
			},
		});
	}, 15000);
});
