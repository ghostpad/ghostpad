**Release Notes - 0.1.1**
- Update documentation to better detail hosting + voice chat quirks
- Display chat character names in bold
- Change “file” button on folders to “folder options” and change icon to open folder
- Move “delete folder” button to folder options submenu.
- Fix broken folder export
- Fix WI text generation not populating input

**Release Notes - 0.1.0**
- Add llama.cpp support

**Release Notes - 0.0.7**
- Remove Horde related code
- Remove Colab / TPU related code
- Remove Aetherroom related ccde
- Upgrade transformers to latest
- Upgrade AutoAWQ to latest
- Upgrade ExLlamaV2 to latest
- Upgrade Flash Attention to latest
- Fix bugs where first action was prepended with a newline
- Remove Basic Huggingface backend
- Remove basic API backend
- Remove GooseAI backend
- Remove OpenAI backend
- Add “Stop on EOS” option which fixes some Yi models producing a `</s>` followed by nonsense.
- Set default mode to chat mode
- Set default username to “User”
- Set default bot name to “Assistant”
- Set `add_bos_token` to False in AWQ backend
- Fix “,” characters appearing after periods with some Llamafied Yi models

**Release Notes - 0.0.6**
- Fix a backend bug where loading a story and editing actions corrupted the internal state and sometimes sent it into a catastrophic infinite loop of edits over the socket. This fix has also been proposed upstream
- Refactor socket connection code on the frontend to make it more intuitive. No functional changes here.
- Use git based exllamav2 on Windows. I had issues installing from pip.
- Rename WPP to "traits" to make it more intuitive for new users. The WPP name still exists as a format option for traits.
- Merge w/ latest henk revision

**Release Notes - 0.0.5**
- Ghostpad's frontend is now 100% static, built using Bun and Vite.
- Removed "game started" check in chat mode - it will now use chat formatting 100% of the time, even if the story is empty.
- Merged with latest revision from henk
- Changed hostname setting to "Hostname Override" - this will now default to empty, and the socket connection will default to the current URL

**Release Notes - 0.0.2**
- Eliminated many excessive React renders
- Fixed a bug where an action was being updated by index instead of ID, causing broken story updates in some cases
- Added Audio Input and Audio Output options to the top-right menu. With both of these enabled in desktop Chrome, you can now have an audio-only conversation with your AI. These are based on the open Web Speech AP>

**Important:** Chrome's implementation of the speech recognition API is not offline - it will send your data remotely.

**Release Notes - 0.0.1**
- This is the very first public release. If everything works perfectly, then I am the luckiest person on this entire planet. But I'm not, and there will be bugs.
- This has been tested on Linux and Mac. I think Windows should work, but these are famous last words. Please open an issue if you have any difficulties on Windows and I'll investigate.
- Major thanks to KoboldAI contributors, the Lexical team @ Meta, DaisyUI contributors, and everyone in the open LLM community.
- 🎉
