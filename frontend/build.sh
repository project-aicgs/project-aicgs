#!/bin/bash
export NODE_OPTIONS="--max_old_space_size=4096"
npm install
npm run build
