/* TEST INPUT:
{
   "id": "l9rkryfrn7",
   "request_start": "2022-10-27T20:21:36.538Z",
   "request_time": 0.1659020390745758,
   "remote_addr": "206.80.131.46",
   "remote_asn": "AS54113 FASTLY",
   "remote_cc": "FI",
   "request_length": 2252,
   "host": "noisy-cheeto.xyz",
   "method": "DELETE",
   "status": 200,
   "uri": "/wp-login.php",
   "upstream_host": "www0",
   "user_agent": "GoobleBot 1.0 (crawler)",
   "content_type": "text/html",
   "tags": []
}
*/

import { log } from "@suborbital/runnable";

export const run = (input) => {
  const tags = [];

  try {
    // Parse request metadata provided by the PRO.xyz backend
    let data = JSON.parse(input);

    // We don't operate Wordpress sites so this is immediately sus
    if (data?.uri?.includes("wp-login.php")) {
      tags.push("kinda-sus");
    }
  } catch (e) {
    log.error("Failed parsing incoming request data as JSON");
  }

  return JSON.stringify(tags);
};
