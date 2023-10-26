#!/bin/bash

# Set environment variables
export VCAP_SERVICES=$(cat "env/VCAP_SERVICE.json")
export VCAP_APPLICATION=$(cat "env/VCAP_APPLICATION.json")

# Run npm
npm run start