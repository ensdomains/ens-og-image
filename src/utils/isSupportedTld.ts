const DNS_OVER_HTTP_ENDPOINT = "https://1.1.1.1/dns-query";

interface DNSRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DNSQuestion {
  name: string;
  type: number;
}

interface DohResponse {
  AD: boolean;
  Answer: DNSRecord[];
  CD: false;
  Question: DNSQuestion[];
  RA: boolean;
  RD: boolean;
  Status: number;
  TC: boolean;
}

export const isSupportedTld = async (name: string) => {
  const tld = name.split(".").pop();
  if (!tld) return false;
  if (tld === "eth") return true;
  if (tld === "[root]") return true;

  const response = await fetch(
    `${DNS_OVER_HTTP_ENDPOINT}?${new URLSearchParams({
      name: tld,
      do: "true",
    })}`,
    {
      headers: {
        accept: "application/dns-json",
      },
    }
  );
  const result = (await response.json()) as DohResponse;
  console.log(tld, result);
  return result?.AD;
};
