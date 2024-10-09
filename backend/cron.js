import { error } from "console";
import { CronJob } from "cron";
import https from "https";

/**schedule the job sending GET request to https://expense-tracker.onrender.com)
  every 14 mins to make the application active on render
  a cron expression which consists of five fields representing: 
  MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK
  14 * * * * - every 14 mins
  0 0 * * 0 - at midnight on every Monday
  30 3 15 * * - at 3:30 Am, on the 15th of every month
  0 0 1 1 * - at midnight , on January 1st
  0 * * * * - every hour
*/

const URL = "https://expense-tracker-fjcg.onrender.com";

const job = new CronJob("*/14 * * * *", function () {
  https
    .get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log("GET request sent successfully");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (err) => {
      console.error("Error while sending request", err);
    });
});
export default job;
