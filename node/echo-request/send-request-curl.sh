#!/usr/bin/env sh

port=${1:-3001}

curl -d 'par1=value1' \
    -d 'par2=value2' \
    -d 'par3=value3&par4=value4' \
    -XPOST "localhost:$port"
