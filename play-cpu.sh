#!/bin/bash
export PYTHONNOUSERSITE=1
export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:./runtime/envs/koboldai-cpu/lib"

if [ ! -f "runtime/envs/koboldai-cpu/bin/python" ]; then
./install_requirements.sh cpu
fi
bin/micromamba run -r runtime -n koboldai-cpu python aiserver.py $*
