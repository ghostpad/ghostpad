## Ghostpad
### A free AI text generation interface based on KoboldAI

Ghostpad builds upon [KoboldAI](https://github.com/KoboldAI/KoboldAI-Client) to offer:
- A new mobile-first UI with customizable fonts and themes
- A "continue" feature, which can be used to generate text mid-story, starting at your cursor.
- A library for your world info and text. Individual memories, author's notes, and world info entries can be saved. These can then be combined together, allowing for a "building block" style experience when designing scenarios and characters.
- Real time edits. Instead of syncing with the server when you defocus the text editor, your changes always take effect immediately.

Ghostpad began as a lightweight personal project that I built so I could more comfortably use LLMs from my couch. It continued to grow and evolve until I decided it's worth sharing with the world.

### Demo Vid

https://github.com/ghostpad/ghostpad/assets/1075900/935b1d25-ac37-4d0a-9bbb-f684d22cfd50

### Release Notes - 0.1
- This is the very first public release. If everything works perfectly, then I am the luckiest person on this entire planet. But I'm not, and there will be bugs.
- This has been tested on Linux and Mac. I think Windows should work, but these are famous last words. Please open an issue if you have any difficulties on Windows and I'll investigate.
- Major thanks to KoboldAI contributors, the Lexical team @ Meta, DaisyUI contributors, and everyone in the open LLM community.
- 🎉

### Requirements
- A light fork of KoboldAI is used to move sessions from Flask to SocketIO, and to optimize performance for real time text input. It shares the same requirements as KoboldAI. https://github.com/ghostpad/koboldai-ghostpad 
- [Node.js](https://nodejs.org/)

### Installation
1. Follow the koboldai-ghostpad installation instructions for your system.

2. Clone Ghostpad, install dependencies, build.
```bash
git clone https://github.com/ghostpad/ghostpad.git
cd ghostpad
npm i && npm run build
```
3. Run Ghostpad using `npm run start`

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

### File Storage
Ghostpad will save your library items to the `Ghostpad` subdirectory in your home directory, which it will create if it doesn't exist. The home directory is used for the privacy of those on multi-user systems.

Files in this directory can be inserted, modified, or shared with others. There is no need to restart after making changes to this folder - the changes will be detected the next time you open the load menu.

### When to use KoboldAI
Full feature parity with KoboldAI isn't a goal, but please open an issue if you feel that a feature is important to have. The feedback will be heard and will help with prioritization.

Here are some things you can do in KoboldAI but **can not** do in Ghostpad:
- Stable diffusion integration
- Upload avatar images for WI entries
- Smooth streaming (one letter at a time)
- Soft prompts
- Privacy password
- Beep on complete
- Horde features (distributed compute cluster)

### Technical Summary

Some of the biggest differences between Ghostpad and KoboldAI are the technical approaches.
- Ghostpad uses React for component-based front end development
- Meta's [Lexical](https://lexical.dev/) library is used as a framework for Ghostpad's text editing features. 
- Tailwind is used for styling
- DaisyUI provides pre-built base components and theming functionality. 
- State is managed using Redux Toolkit for ease of debugging - using the Redux developer extension, you can monitor Kobold's entire synced state at any point during runtime.

### Roadmap
- Desktop UI: With the needs of mobile users now met, one of the first things I'd like to do is spend some time building breakpoints and additional UI options for large screens (e.g. docked sidebar).
- Various backend optimizations: For phase 1 of this project, I self-imposed a rule to avoid complex backend changes. That rule is now cautiously lifted. Anything suitable for upstream Kobold will be opened there. There's still very much a need to avoid "hard fork" changes that will fragment community efforts.
- Stable Diffusion integration: would be nice to have
- Themes: The themes are currently default DaisyUI themes, and I want to build a selection of custom themes
