#!/bin/bash
export PYTHONNOUSERSITE=1
git submodule update --init --recursive
if [[ $1 = "cuda" || $1 = "CUDA" ]]; then
wget -qO- https://micromamba.snakepit.net/api/micromamba/linux-64/latest | tar -xvj bin/micromamba
bin/micromamba create -f environments/huggingface.yml -r runtime -n koboldai -y
# Weird micromamba bug causes it to fail the first time, running it twice just to be safe, the second time is much faster
bin/micromamba create -f environments/huggingface.yml -r runtime -n koboldai -y
exit
fi
if [[ $1 = "rocm" || $1 = "ROCM" ]]; then
wget -qO- https://micromamba.snakepit.net/api/micromamba/linux-64/latest | tar -xvj bin/micromamba
bin/micromamba create -f environments/rocm.yml -r runtime -n koboldai-rocm -y
# Weird micromamba bug causes it to fail the first time, running it twice just to be safe, the second time is much faster
bin/micromamba create -f environments/rocm.yml -r runtime -n koboldai-rocm -y
exit
fi
if [[ $1 = "ipex" || $1 = "IPEX" ]]; then
wget -qO- https://micromamba.snakepit.net/api/micromamba/linux-64/latest | tar -xvj bin/micromamba
bin/micromamba create -f environments/ipex.yml -r runtime -n koboldai-ipex -y
# Weird micromamba bug causes it to fail the first time, running it twice just to be safe, the second time is much faster
bin/micromamba create -f environments/ipex.yml -r runtime -n koboldai-ipex -y
exit
fi
if [[ $1 = "cpu" || $1 = "CPU" ]]; then
wget -qO- https://micromamba.snakepit.net/api/micromamba/linux-64/latest | tar -xvj bin/micromamba
bin/micromamba create -f environments/cpu.yml -r runtime -n koboldai-cpu -y
# Weird micromamba bug causes it to fail the first time, running it twice just to be safe, the second time is much faster
bin/micromamba create -f environments/cpu.yml -r runtime -n koboldai-cpu -y
exit
fi
echo Please specify either CUDA or ROCM or IPEX
