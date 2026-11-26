# DS2 Camera Smoothing 1.0.1 source review

This repository contains the source for moderation review, not an installer, download mirror, or an alternate release. The Nexus listing under review is https://www.nexusmods.com/darksiders2deathinitiveedition/mods/68.

- Nexus file: DS2 Camera Smoothing 1.0.1 Offline HTML (file ID 142)
- SHA-256 of the exact submitted ZIP: 59e690808f8218c68577325f1ada3e4654adefd4df2c7cba55ccd04d2540cee3
- Steam target: Darksiders II Deathinitive Edition closed beta, build 17701647

`src/patcher.js` is the browser logic extracted from the exact release, with the two embedded BPS release payloads redacted. `src/page-review.html` shows the submitted page markup with the script separated for review. These representations are not runnable releases. The HTML shipped on Nexus contains the actual payloads and can be inspected in the quarantined ZIP; no executable, game asset, ready-to-apply patch, or download is hosted here.

`tools/` contains the browser template and generator source, the BPS generator, and source for the camera and loader changes. The generators consume locally supplied stock game files and local development inputs; those are intentionally not included. Some scripts reference their original development paths. This repository is intended to support review of the submitted code, not reproduce the entire original build workspace.

The submitted HTML reads only the two user-selected files via browser file input, validates their known versions, applies the BPS patches locally, verifies the outputs with SHA-256, and lets the user download the replacements. It does not overwrite inputs or communicate over the network. The separate 1.0.1 loader fix corrects the virtual extent of a section in the locally patched PE so Windows can load it.

## Camera implementation

See [Camera changes in the exact 1.0.1 release](docs/camera-changes.md) for the native code, the final 17 camera-descriptor edits, and verified output hashes.
