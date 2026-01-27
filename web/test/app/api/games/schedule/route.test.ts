import axios from "axios";
import * as db from "@/lib/db";
import { POST } from "@/app/api/games/schedule/route";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios");
vi.mock("@/lib/db", () => ({ query: vi.fn() }));

const mockAxios = vi.mocked(axios, { partial: true, deep: true });
const mockQuery = vi.mocked(db.query);

const mockApiResponse = (gameCount: number = 10) => ({
	data: {
		gameInfo: Array.from({ length: gameCount }, (_, i) => ({
			uuid: `game-${i}`,
			startDateTime: "2025-09-13 15:15:00",
			state: "post-game",
			homeTeamInfo: { uuid: "home", code: "FHC", names: {}, score: 2 },
			awayTeamInfo: { uuid: "away", code: "LHC", names: {}, score: 1 },
		})),
	},
	status: 200,
	statusText: "OK",
	headers: {},
	config: {} as any,
});

describe("POST /api/games/schedule", () => {
	beforeEach(() => vi.clearAllMocks());

	it("should fetch and save game schedule with defaults", async () => {
		mockQuery
			.mockResolvedValueOnce([{ season_uuid: "s1" }])
			.mockResolvedValueOnce([{ series_uuid: "sr1" }])
			.mockResolvedValueOnce([{ game_type_uuid: "gt1" }])
			.mockResolvedValueOnce([]);

		(mockAxios.get as any).mockResolvedValueOnce(mockApiResponse(5));

		const request = new Request("http://localhost:3000/api/games/schedule");
		const response = await POST(request);
		const data = await response.json();

		expect(data).toMatchObject({
			success: true,
			message: "Fetched and saved 5 games to bronze.shl_game_schedule",
			seasonUuid: "s1",
			seriesUuid: "sr1",
			gameTypeUuid: "gt1",
		});

		expect(mockQuery).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO bronze.shl_game_schedule"),
			["s1", expect.any(String)],
		);
	});

	it("should use provided query parameters", async () => {
		mockQuery.mockResolvedValueOnce([]);
		(mockAxios.get as any).mockResolvedValueOnce(mockApiResponse(3));

		const request = new Request(
			"http://localhost:3000/api/games/schedule?seasonUuid=custom-s&seriesUuid=custom-sr&gameTypeUuid=custom-gt",
		);
		const response = await POST(request);
		const data = await response.json();

		expect(data.seasonUuid).toBe("custom-s");
		expect(data.seriesUuid).toBe("custom-sr");
		expect(data.gameTypeUuid).toBe("custom-gt");

		expect(mockAxios.get).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				params: {
					seasonUuid: "custom-s",
					seriesUuid: "custom-sr",
					gameTypeUuid: "custom-gt",
				},
			}),
		);
	});

	it("should return 400 when reference data is missing", async () => {
		mockQuery.mockResolvedValueOnce([]);

		const request = new Request("http://localhost:3000/api/games/schedule");
		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain("No current season found");
	});

	it("should return 404 when no games found", async () => {
		mockQuery
			.mockResolvedValueOnce([{ season_uuid: "s1" }])
			.mockResolvedValueOnce([{ series_uuid: "sr1" }])
			.mockResolvedValueOnce([{ game_type_uuid: "gt1" }]);

		(mockAxios.get as any).mockResolvedValueOnce({ data: [] });

		const request = new Request("http://localhost:3000/api/games/schedule");
		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data.error).toContain("No games found");
	});

	it("should handle API errors", async () => {
		mockQuery.mockResolvedValue([
			{ season_uuid: "s1" },
			{ series_uuid: "sr1" },
			{ game_type_uuid: "gt1" },
		]);

		const error = Object.assign(new Error("Network Error"), {
			isAxiosError: true,
			response: { status: 503 },
		});
		(mockAxios.get as any).mockRejectedValueOnce(error);
		(mockAxios.isAxiosError as any) = vi.fn().mockReturnValue(true);

		const request = new Request("http://localhost:3000/api/games/schedule");
		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(503);
		expect(data.error).toContain("Failed to fetch game schedule");
	});

	it("should handle database errors", async () => {
		mockQuery.mockRejectedValueOnce(new Error("DB connection failed"));

		const request = new Request("http://localhost:3000/api/games/schedule");
		const response = await POST(request);
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data.error).toContain("DB connection failed");
	});
});
