import axios from "axios";
import * as db from "@/lib/db";
import { POST } from "@/app/api/reference/sync/route";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios");
vi.mock("@/lib/db", () => ({ query: vi.fn() }));

const mockAxios = vi.mocked(axios, { partial: true, deep: true });
const mockQuery = vi.mocked(db.query);

const mockApiResponse = (data: any) => ({
	data,
	status: 200,
	statusText: "OK",
	headers: {},
	config: {} as any,
});

describe("POST /api/reference/sync", () => {
	beforeEach(() => vi.clearAllMocks());

	it("should sync reference data successfully", async () => {
		mockQuery.mockResolvedValue([]);
		(mockAxios.get as any).mockResolvedValueOnce(
			mockApiResponse({
				season: [
					{
						uuid: "s1",
						code: "2025",
						names: [{ language: "sv", translation: "2025/2026" }],
					},
					{
						uuid: "s2",
						code: "2024",
						names: [{ language: "sv", translation: "2024/2025" }],
					},
				],
				series: [
					{
						uuid: "sr1",
						code: "SHL",
						names: [{ language: "sv", translation: "SHL" }],
					},
				],
				gameType: [
					{
						uuid: "gt1",
						code: "regular",
						names: [{ language: "sv", translation: "Grundserie" }],
					},
				],
				defaultSsgtFilter: { season: "s1", series: "sr1", gameType: "gt1" },
			}),
		);

		const response = await POST();
		const data = await response.json();

		expect(data).toMatchObject({
			success: true,
			message: "Reference data synced successfully",
			stats: {
				seasons: 2,
				series: 1,
				gameTypes: 1,
				currentSeason: "2025/2026",
			},
		});
		expect(mockQuery).toHaveBeenCalledTimes(4);
	});

	it("should use translation fallback: sv > en > code", async () => {
		mockQuery.mockResolvedValue([]);
		(mockAxios.get as any).mockResolvedValueOnce(
			mockApiResponse({
				season: [{ uuid: "s1", code: "CODE", names: [] }],
				series: [
					{
						uuid: "sr1",
						code: "CODE",
						names: [{ language: "en", translation: "English" }],
					},
				],
				gameType: [
					{
						uuid: "gt1",
						code: "CODE",
						names: [
							{ language: "en", translation: "English" },
							{ language: "sv", translation: "Swedish" },
						],
					},
				],
				defaultSsgtFilter: { season: "s1", series: "sr1", gameType: "gt1" },
			}),
		);

		await POST();

		expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
			"s1",
			"CODE",
			"CODE",
			true,
		]);
		expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
			"sr1",
			"CODE",
			"English",
		]);
		expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [
			"gt1",
			"CODE",
			"Swedish",
		]);
	});

	it("should handle API errors", async () => {
		const error = Object.assign(new Error("Network Error"), {
			isAxiosError: true,
			response: { status: 503 },
		});
		(mockAxios.get as any).mockRejectedValueOnce(error);
		(mockAxios.isAxiosError as any) = vi.fn().mockReturnValue(true);

		const response = await POST();
		const data = await response.json();

		expect(response.status).toBe(503);
		expect(data.error).toContain("Failed to fetch reference data");
	});

	it("should handle database errors", async () => {
		mockQuery.mockRejectedValueOnce(new Error("DB error"));
		(mockAxios.get as any).mockResolvedValueOnce(
			mockApiResponse({
				season: [{ uuid: "s1", code: "2025", names: [] }],
				series: [],
				gameType: [],
				defaultSsgtFilter: { season: "s1", series: "sr1", gameType: "gt1" },
			}),
		);

		const response = await POST();
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data.error).toContain("DB error");
	});
});
