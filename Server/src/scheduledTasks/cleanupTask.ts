import cron from "node-cron";
import { cleanupIncompleteUploads } from "services/uploadCleanupService";

export const scheduledCleanupTask = () => {
  // run cleanup tasks everyday at 3:00 AM
  cron.schedule("0 3 * * *", async () => {
    console.log("Running cleanup task for incomplete uploads...");
    try {
      await cleanupIncompleteUploads();
      console.log("Cleanup task completed successfully");
    } catch (error) {
      console.error("Error during cleanup task:", error);
    }
  });
};
