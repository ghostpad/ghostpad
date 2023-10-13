## Ghostpad
### A free AI text generation interface based on KoboldAI

Ghostpad builds upon [KoboldAI](https://github.com/KoboldAI/KoboldAI-Client) to offer:
- A new mobile-first UI with customizable fonts and themes
- A "continue" feature, which can be used to generate text mid-story, starting at your cursor.
- Audio input and output, allowing for hands-free conversations using speech only.
- A library for your world info and text. Individual memories, author's notes, and world info entries can be saved. These can then be combined together, allowing for a "building block" style experience when designing scenarios and characters.
- Real time edits. Instead of syncing with the server when you defocus the text editor, your changes always take effect immediately.
- WPP to text. If you've ever designed a character using the WPP format and wanted to combine it with plain text, you can now do this with the "Insert WPP in Text" button.
- Hugging Face search
- AutoAWQ support

https://github.com/ghostpad/ghostpad/assets/1075900/273034da-05f3-4652-aad0-78ef2399d310

### Installation
1. Follow the [KoboldAI installation instructions](https://github.com/henk717/KoboldAI#install-koboldai-on-your-own-computer).

2. Open [http://localhost:5000](http://localhost:5000) in your browser.  You can access KoboldAI UI2 through http://localhost:5000/new_ui and UI1 through http://localhost:5000/classic

### When to use KoboldAI
Here are some things you can do in the KoboldAI UI but **can not** do in Ghostpad:
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

### Misc Demo Videos

Continuing generation mid-story



https://github.com/ghostpad/ghostpad/assets/1075900/205692c5-aef9-4bea-99ce-1cf97e2100c1



Opening the Hugging Face browser and loading a tiny model




https://github.com/ghostpad/ghostpad/assets/1075900/dc204936-115f-4227-b3d9-b854c26c4107


