# Wanderer

An ambient ASCII world to study to. Wick, a little paper-lantern spirit, travels through six biomes (forest, rolling hills, town, lake, under the sea, a mountain dome) under a sky that follows your real clock, while your Spotify song plays in a TV-style player.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173 and press `F` for full screen. The first time it runs, macOS asks to let Terminal control Spotify; click Allow.

| Key | Does |
|---|---|
| `M` | next biome |
| `F` | full screen |
| `Space` | play / pause |
| `←` `→` | previous / next song |
| `O` | open the Spotify app to pick music |

Biomes change every 6 minutes. Open `http://127.0.0.1:5173/?switch=song` to change them on every new song instead. Add `?hour=22` to preview a time of day.

The scene engine in `public/design/` comes from the Wanderer v2 Claude Design project; the only change is a `pipX` option for Wick's position.

Spotify is read from the desktop app through AppleScript (`bridge/server.mjs`), so it needs no login and works on Free. It only sees music playing on this Mac.

To change what's playing, click the list icon (or press `O`). It brings the Spotify app to the front; pick anything from your library and Wanderer follows along.
