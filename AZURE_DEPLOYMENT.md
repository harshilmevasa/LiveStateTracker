# Azure Deployment Guide

This guide provides step-by-step instructions for deploying the LiveStateTracker application to Azure App Service.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed locally
- Git repository with your code

### Required Environment Variables

```
NODE_ENV = production
PORT = 8080
MONGODB_URI = your_mongodb_connection_string_here
FRONTEND_URL = https://your-app-name.azurewebsites.net
WEBSITE_NODE_DEFAULT_VERSION = ~20
SCM_DO_BUILD_DURING_DEPLOYMENT = true
```

## Deployment Steps

### 1. Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name LiveStateTracker-rg --location "Canada Central"

# Create App Service plan
az appservice plan create --name LiveStateTracker-plan --resource-group LiveStateTracker-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group LiveStateTracker-rg --plan LiveStateTracker-plan --name your-app-name --runtime "NODE:20-lts"
```

### 2. Configure Application Settings

Set the environment variables in Azure:

```bash
az webapp config appsettings set --resource-group LiveStateTracker-rg --name your-app-name --settings NODE_ENV=production PORT=8080 MONGODB_URI="your_connection_string" FRONTEND_URL="https://your-app-name.azurewebsites.net" WEBSITE_NODE_DEFAULT_VERSION="~20" SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### 3. Deploy from Git

```bash
# Configure deployment source
az webapp deployment source config --resource-group LiveStateTracker-rg --name your-app-name --repo-url https://github.com/your-username/LiveStateTracker --branch main --manual-integration

# Or deploy from local Git
az webapp deployment source config-local-git --resource-group LiveStateTracker-rg --name your-app-name
```

### 4. Monitor Deployment

Check deployment logs in the Azure portal or using Azure CLI:

```bash
az webapp log tail --resource-group LiveStateTracker-rg --name your-app-name
```

## Configuration Files

The repository includes Azure-specific configuration files:

- `deploy.cmd` - Custom deployment script for Azure
- `web.config` - IIS configuration for routing
- `.deployment` - Specifies the deployment command

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are listed in package.json
2. **Port Issues**: Ensure PORT environment variable is set to 8080
3. **Database Connection**: Verify MONGODB_URI is correctly set
4. **Static Files**: Check that build artifacts are in the correct location

### Logs

Access application logs:

```bash
# Stream logs
az webapp log tail --resource-group LiveStateTracker-rg --name your-app-name

# Download logs
az webapp log download --resource-group LiveStateTracker-rg --name your-app-name
```

## Security Considerations

- Use Azure Key Vault for sensitive configuration
- Enable HTTPS only
- Configure custom domains with SSL certificates
- Set up monitoring and alerts

## Scaling

- Use Azure App Service scaling options
- Consider Azure Application Gateway for load balancing
- Monitor performance metrics in Azure portal

## Backup and Recovery

- Enable automatic backups in Azure App Service
- Set up database backups for MongoDB
- Document recovery procedures
