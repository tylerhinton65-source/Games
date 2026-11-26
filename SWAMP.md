# Swamp Defense: map for whoever edits it next

The game is one page plus two helper scripts:

| File | What's in it |
|---|---|
| `swamp.html` | Everything else: CSS, title/pause/sound/zone panels, game loop, zombies, guns, turrets, shop, swamp scenery, sound effects |
| `swamp-beach.js` | Zone 2 (Beach): `isBeach()`, `palm()`, `drawBeachBG()` (static picture), `drawBeachLife()` + `beachExtras()` (boat, lighthouse, foam, ship, dolphin, gulls, paraglider, crab; switches in `BEACH_FX`) |
| `swamp-music.js` | Music: Bayou Stomp (title), Moonlight Gator (shop). `musicStep()` runs every frame. `MUSIC=false` turns it off |

`swamp.html` loads both scripts **before** its main script. They only use the main script's globals (`SET`, `L`, `W`, `ctx`, `AC`, `TIME`…) at call time.

## Don't read the whole thing
Search for these markers instead (`grep -n`):

- `function layout(` sets world anchors: `L.FLOOR` porch 262, `L.FX` fence 266, the lane is y 296–384, `L.POOL0/1` is the swimmer pool
- `const ZT={` lists zombie types · `const BOSSES` · `function spawnZ(` · `function kill(` · `function zombieStep` / `zombieStep(dt)`
- `TURRETS` / `FENCES` / guns: the shop config · `function styleRows(` is the Style menu (hats, shades, flags, gator, zone)
- `function drawBG(` is the swamp background (beach returns early to `drawBeachBG`) · `function drawCabin(` (has `BCH` beach tweaks) · `function cypress(`
- `function stepBenji(` (`BENJI_CHAD`) · `function stepGus(` · `function drawWildlife(` (beach → `drawBeachLife`)
- `function snd(` / `function sfx(` handle sound effects; `masterOut()` is the master volume; `wakeAudio()` fixes iPhone audio
- `function goZone(` / `ZONES=` / `function openZones(` power the zone picker; `ZONE_SUF` keeps separate saves per zone
- `function frame(` is the main loop · `window.SD=` holds the test hooks

Feature switches (set to `false` to undo): `SPACE_TREES`, `FILL_GAP`, `SMOOTH_TREES`, `BENJI_CHAD`, `RAISE_GROUND_TURRETS`, `MORE_SOUNDS`, `MUSIC`, `BEACH_ZONE`, `BEACH_FX.*`.

## Saves (localStorage, per player via `PK()`)
`swamp_run2` (game in progress), `swamp_best` (best score and wave), `swamp_set` (style, sound, volume, music, zone). The beach adds `_beach` to run and best.

## Shipping a change
1. `git fetch` and rebase onto `origin/main`. Other chats push to this repo all the time.
2. Bump `VERSION` in `sw.js` past whatever is on main. Phones only update when it changes.
3. New script files go in `FILES` in `sw.js`. `.js` files are loaded network-first, like pages, so they always match their page.
4. Test with Playwright + Chromium (844×390 landscape): `SD.newGame()`, then click "Start Wave".
5. Push with `git -c push.negotiate=true push origin HEAD:main`.
