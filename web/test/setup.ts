import { beforeAll, afterAll } from "vitest";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

beforeAll(() => {
	// Environment variables are already loaded from .env
	// You can override specific test values here if needed
});

afterAll(() => {
	// Cleanup if needed
});
