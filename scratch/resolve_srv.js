import dns from 'dns/promises';

async function main() {
  try {
    const srvs = await dns.resolveSrv('_mongodb._tcp.cluster0.neydetp.mongodb.net');
    console.log("Resolved SRV records:", srvs);
  } catch (e) {
    console.error("DNS SRV resolve failed:", e);
  }
}

main();
