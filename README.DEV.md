Local dev notes

How to run the app and test it from other devices on your LAN:

1) Expose frontend dev server on all interfaces

  npm run dev

  (the `dev` script is configured to run `vite --host 0.0.0.0` so Vite will listen on 0.0.0.0)

2) Set the backend URL in your local `.env` (copy from `.env.example`)

  # .env
  VITE_API_BASE_URL="http://192.168.1.42:8000"

  Replace 192.168.1.42 with the IP of the machine that runs the API backend. If backend runs on the same machine, this can point to the same host.

3) Allow firewall access (Windows)

- If you run the dev server locally and you want other devices to connect, ensure Windows Firewall allows node.exe/vite to accept connections or add an inbound rule for the port (default 5173 for Vite, or the port printed in the console).

4) CORS and backend configuration

- Ensure the backend accepts cross-origin requests from the frontend origin. In dev, if you access the frontend from another device, the origin will be `http://<dev-machine-ip>:5173`. Configure the backend CORS to allow that origin (or use `*` in dev).

5) Test

- Start the dev server: `npm run dev`
- From another device in the same network, open `http://<dev-machine-ip>:5173`
- Use browser DevTools Network tab to confirm requests go to `VITE_API_BASE_URL`.

If you want, I can:
- Add a `.env` with a sensible default for local LAN testing (e.g., `http://0.0.0.0:8000`) — but it's better to set the actual IP.
- Add a script to run Vite on a specific port.
- Adjust backend CORS helper snippets for common frameworks (Laravel, Express).
