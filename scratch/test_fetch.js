async function test() {
  const url = 'https://regxperts.com:5001/uploads/participant-photo-1781846467364-162985392.jpg';
  const urlHttp = 'http://regxperts.com:5001/uploads/participant-photo-1781846467364-162985392.jpg';
  try {
    console.log("Fetching url on port 5001 HTTPS...");
    const res = await fetch(url).catch(e => e);
    if (res instanceof Error) {
      console.log("HTTPS fail:", res.message);
    } else {
      console.log("HTTPS status:", res.status, res.statusText);
      console.log("HTTPS Content-Type:", res.headers.get("content-type"));
    }

    console.log("\nFetching url on port 5001 HTTP...");
    const resHttp = await fetch(urlHttp).catch(e => e);
    if (resHttp instanceof Error) {
      console.log("HTTP fail:", resHttp.message);
    } else {
      console.log("HTTP status:", resHttp.status, resHttp.statusText);
      console.log("HTTP Content-Type:", resHttp.headers.get("content-type"));
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
