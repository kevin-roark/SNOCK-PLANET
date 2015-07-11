# SNOCK-PLANET
NEW LIFE

## WHAT
persistent planet layer  
3d chat zone  
forum 2.0  
fear nothing

## HOW TO RUN
* There are three separate PLANET processes
  * app.js: web server
  * io.js: websocket server
  * emitter.js: global state broadcaster
* Run one process of emitter always
* Run multiple processes of app and io as desired
* Requires mongo and redis to be up and running first! (mongod, redis-server)
* You can use the ./run.sh script for a development environment
