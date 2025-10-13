# Infra (Bicep Skeleton)

## Files

- `main.bicep` – root template with params: `location`, `appName`, `appServicePlanSku`
- `modules/` – placeholders for future modules
- `parameters/dev.parameters.json` – example parameters

## Commands

```bash
# Syntax check / build
az bicep build --file infra/main.bicep

# What-if (dry run) example
az deployment group what-if \
  --resource-group <rg-name> \
  --template-file infra/main.bicep \
  --parameters @infra/parameters/dev.parameters.json
```

## App Service WebSockets

- Ensure `WEBSITES_ENABLE_APP_SERVICE_STORAGE` and WebSockets settings are compatible with realtime features (Socket.IO) in future phases.
