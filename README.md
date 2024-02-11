## Ghostpad
### A free AI text generation interface based on KoboldAI

**Update Dec 07 2023: Ghostpad now supports Llama.cpp! A few smaller changes can also be found in CHANGELOG.md**

Ghostpad builds upon [KoboldAI](https://github.com/KoboldAI/KoboldAI-Client) to offer:
- A new mobile-first UI with customizable fonts and themes and a Hugging Face browser.
- A "continue" feature, which can be used to generate text mid-story, starting at your cursor.
- Audio input and output, allowing for hands-free conversations using speech only.
- Real time editing. Instead of syncing with the server when you defocus the text editor, your changes always take effect immediately.
- A library for your world info and text. Individual memories, author's notes, and world info entries can be saved. These can then be combined together, allowing for a "building block" style experience when designing scenarios and characters.
- AutoAWQ and Llama.cpp support




https://github.com/ghostpad/ghostpad/assets/1075900/18e31eab-0292-4c34-8d10-93a462ddcf56



### Installation
**Windows (NVidia GPU)**
- Install version 11.8 of the CUDA Toolkit (https://developer.nvidia.com/cuda-11-8-0-download-archive)
- Clone the URL of the Github repository (git clone https://github.com/ghostpad/ghostpad.git)
- Open install_requirements.bat as administrator.
- Choose option 1 to use a temporary drive.
- Once this is complete, run `play.bat`

**Windows (CPU)**
- Clone the URL of the Github repository (git clone https://github.com/ghostpad/ghostpad.git)
- Open install_requirements_cpu.bat as administrator.
- Choose option 1 to use a temporary drive.
- Once this is complete, run `play.bat`

**Linux**
- Clone the URL of the Github repository (git clone https://github.com/ghostpad/ghostpad.git)
- *Using CPU only?* Run play-cpu.sh
- *NVidia user?* Run play.sh
- *AMD user? Make sure ROCm is installed.* Run play-rocm.sh
- *Intel ARC user? Make sure OneAPI is installed.* Run play-ipex.sh

**MacOS**
- Clone the URL of the Github repository (git clone https://github.com/ghostpad/ghostpad.git)
- Run play-macos.sh

### Network Access

If you would like for Ghostpad to be accessible over your local network, add `--host` after the play script:

`play.sh --host`

or

`play.bat --host`

Upon running the appropriate play script, you can open [http://localhost:5050](http://localhost:5050) in your browser.  You can access KoboldAI UI2 through http://localhost:5050/new_ui and UI1 through http://localhost:5050/classic

### Voice Chat On Remote Hosts

Let's say you have two PCs, you are running Ghostpad on PC 1, and you want to use voice chat over your local network on PC 2. You will need to open `chrome://flags` on PC 2 and search for `Insecure origins treated as secure`, then add PC 1's URL here. This allows it to use your microphone without using https.

### Misc Demo Videos

Continuing generation mid-story

https://github.com/ghostpad/ghostpad/assets/1075900/205692c5-aef9-4bea-99ce-1cf97e2100c1

