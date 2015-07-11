#!/bin/bash

export NODE_ENV=development

# start the state emitter
node planet/emitter.js &

# start the IO server
node planet/io.js &

# start the web server
node planet/app.js &

wait
