export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const routes = {
      "/api/fan": { pin: "V0", device: "fan" },
      "/api/light": { pin: "V1", device: "light" },
      "/api/buzzer": { pin: "V2", device: "buzzer" }
    };

    const route = routes[url.pathname];

    if (route && request.method === "POST") {
      try {
        const body = await request.json();
        const value = body.value;

        if (value !== 0 && value !== 1) {
          return Response.json(
            { error: "Value must be 0 or 1" },
            { status: 400 }
          );
        }

        if (!env.BLYNK_AUTH_TOKEN) {
          return Response.json(
            { error: "Blynk token is not configured" },
            { status: 500 }
          );
        }

        const blynkUrl = new URL(
          "https://blynk.cloud/external/api/update"
        );

        blynkUrl.searchParams.set("token", env.BLYNK_AUTH_TOKEN);
        blynkUrl.searchParams.set(route.pin, String(value));

        const response = await fetch(blynkUrl);

        if (!response.ok) {
          return Response.json(
            { error: "Blynk request failed" },
            { status: 502 }
          );
        }

        return Response.json({
          success: true,
          device: route.device,
          value: value
        });
      } catch (error) {
        return Response.json(
          { error: "Request failed" },
          { status: 400 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};