#!/bin/bash
export PYTHONNOUSERSITE=1
git submodule update --init --recursive
wget -qO- https://micromamba.snakepit.net/api/micromamba/osx-arm64/latest | tar -xvj bin/micromamba
bin/micromamba create -f environments/cpu.yml -r runtime -n koboldai-cpu -y
# Weird micromamba bug causes it to fail the first time, running it twice just to be safe, the second time is much faster
bin/micromamba create -f environments/cpu.yml -r runtime -n koboldai-cpu -y
exit
