# Set an environment variable
$Env:VCAP_SERVICES = Get-Content "env/VCAP_SERVICE.json"
$Env:VCAP_APPLICATION = Get-Content "env/VCAP_APPLICATION.json"

# echo $VCAP_SERVICES
#Write-Output $VCAP_SERVICES

# Run npm
npm run start