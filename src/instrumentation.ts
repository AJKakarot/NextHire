export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initDb } = await import("./lib/server/db");
    try {
      await initDb();
    } catch (error) {
      console.error("Database init failed", error);
    }
  }
}
