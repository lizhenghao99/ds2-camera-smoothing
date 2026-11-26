# Camera changes in the exact 1.0.1 release

This is a source review of the two camera-related outputs already held by Nexus Mods, not a new binary distribution.

| Component | Source | What it changes |
| --- | --- | --- |
| Native camera code | [build-camera-production.cjs](../tools/build-camera-production.cjs) | Emits the x64 camera adjustment, including movement-state dispatch, stock scripted-camera guards, pitch blend curves and time constants for walking, dodging, riding, and mount transitions. |
| Preserve scripted resets | [build-camera-production-reset.cjs](../tools/build-camera-production-reset.cjs) | Restores the native forced-camera reset condition and preserves both original branch destinations. |
| 1.0.1 loader fix | [candidate.cjs](../tools/candidate.cjs) | Changes only the virtual size of the existing .camdiag section from 0x300 to 0x201000. |
| Camera descriptors | [build-release-camera-archive.cjs](../tools/build-release-camera-archive.cjs) | Rebuilds the exact shipped scripts.obsp from the stock archive; adds the authored camera-mode values to 17 descriptors in records 3121 and 5830. It copies the other 7,882 payloads unchanged and updates offsets and sizes. |

The descriptor float values are intentionally distinct at the raw IEEE-754 level. The native camera code uses those same bit patterns to recognize the corresponding movement scopes. See the labels and branch conditions in the camera production script. The earlier three-descriptor prototype in tools/build-locomotion-scope.cjs is a historical reference, not the shipped archive edit.

## Byte-level verification

The production camera generator was rerun from the pinned development camera base (SHA-256 59df7b1de42762f9fbb53370caabbeee3bc567911ef25c282222553968853da0) and its captured geometry validation input. The camera generator output was a9594ca71b52c2a10ff5a2bc548b0f8f041943a3657475aa0875782106c4385a. The reset helper then produced the exact 1.0 executable, and the loader helper produced the exact 1.0.1 output. The camera base and private trace are not included. This validates the named stages but does not claim a clean checkout independently reconstructs the original development base.

Separately, the archive code above was run on the clean stock archive and reproduced the exact shipped archive, without an intermediate or embedded binary patch.

| Verified file | SHA-256 |
| --- | --- |
| 1.0.1 Darksiders2.exe output | fb87aed51009a70f206bad406398f4fe4d55169eb8934e4d3ecaeb0f64f7d2b3 |
| 1.0.1 media/scripts.obsp output | da2cd17d4f3604e266e807eed0853ce472881e2c21f119d36edf3b9ee1669156 |
| 1.0.1 Nexus ZIP (file 142) | 59e690808f8218c68577325f1ada3e4654adefd4df2c7cba55ccd04d2540cee3 |
