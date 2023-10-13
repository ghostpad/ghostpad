**Release Notes - 0.5**
- Ghostpad's frontend is now 100% static, built using Bun and Vite.
- Removed "game started" check in chat mode - it will now use chat formatting 100% of the time, even if the story is empty.
- Merged with latest revision from henk
- Changed hostname setting to "Hostname Override" - this will now default to empty, and the socket connection will default to the current URL

**Release Notes - 0.2**
- Eliminated many excessive React renders
- Fixed a bug where an action was being updated by index instead of ID, causing broken story updates in some cases
- Added Audio Input and Audio Output options to the top-right menu. With both of these enabled in desktop Chrome, you can now have an audio-only conversation with your AI. These are based on the open Web Speech AP>

**Important:** Chrome's implementation of the speech recognition API is not offline - it will send your data remotely.

**Release Notes - 0.1**
- This is the very first public release. If everything works perfectly, then I am the luckiest person on this entire planet. But I'm not, and there will be bugs.
- This has been tested on Linux and Mac. I think Windows should work, but these are famous last words. Please open an issue if you have any difficulties on Windows and I'll investigate.
- Major thanks to KoboldAI contributors, the Lexical team @ Meta, DaisyUI contributors, and everyone in the open LLM community.
- 🎉
