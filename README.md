# Wanderer

An ambient ASCII landscape to study to. A little creature walks through forests, paddles across lakes, bikes over hills and wanders under the stars, while the song playing in your Spotify Mac app shows in the corner.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173 and press `F` for full screen. The first time it runs, macOS asks to let Terminal control Spotify; click Allow.

| Key | Does |
|---|---|
| `M` | next landscape |
| `F` | full screen |
| `Space` | play / pause |
| `←` `→` | previous / next song |
| `O` | open the Spotify app to pick music |

Landscapes change every 4 minutes. Open `http://127.0.0.1:5173/?switch=song` to change them on every new song instead. Day or night colors follow your clock.

Spotify is read from the desktop app through AppleScript (`bridge/server.mjs`), so it needs no login and works on Free. It only sees music playing on this Mac.

To change what's playing, click the list icon (or press `O`). It brings the Spotify app to the front; pick anything from your library and Wanderer follows along.
