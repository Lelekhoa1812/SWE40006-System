@minLength(2)
param location string = resourceGroup().location
param appName string
param appServicePlanSku string = 'B1'

// TODO: modules to be wired in next increments
module appService 'modules/appservice.bicep' = if (false) {
  name: 'appServiceModule'
  params: {
    appName: appName
    location: location
    appServicePlanSku: appServicePlanSku
  }
}

module insights 'modules/insights.bicep' = if (false) {
  name: 'insightsModule'
  params: {
    location: location
    appName: appName
  }
}


