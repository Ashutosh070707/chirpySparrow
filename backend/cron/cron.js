import cron from "cron";
import https from "https";

const URL = "https://threads-project-3.onrender.com";

// Define the task to run every 14 minutes
const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode == 200) {
        console.log("GET request sen successfully");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (e) => {
      console.log("Error while sending request", e);
    });
});
export default job;
