#!/bin/bash
export PYTHONNOUSERSITE=1
export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:./runtime/envs/koboldai/lib"

if [ ! -f "runtime/envs/koboldai/bin/python" ]; then
./install_requirements.sh cuda
fi
bin/micromamba run -r runtime -n koboldai python aiserver.py $*
