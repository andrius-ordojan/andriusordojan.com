+++ 
draft = true
date = 2023-02-13T01:59:41+01:00
title = "Azure - using az cli to add API permissions to a service principal"
description = ""
slug = ""
authors = []
tags = []
categories = []
externalLink = ""
series = []
+++

# The why

Running terraform through CI agents requires a service principal to be created. When using the azuread provider it is needed to grant the service principal certain permissions for it to function. The manual steps are documented here. However, in my case, I have a script that automatically sets up the service principal for terraform as well as the needed resources for the storage of the state file. I always prefer to have configuration steps scripted and in version control. This allows for reviews of future changes and reduces the chances of human error. Also, checklists and wiki articles are pretty terrible in my experience.

# The how

## Creating a new service principal and getting the application ID

The documentation for this command is here. It’s possible to add scope to this command and it will create a role assignment as well. Piping the response to ConvertFrom-Json -AsHashtable will make it more convenient to utilize the values later on.

``` powershell
param (
    [Parameter(Mandatory=$true)]
    [string]
    $appName
)

$credentials = $(az ad sp create-for-rbac -n $appName | ConvertFrom-Json -AsHashtable)
```

## Getting the application ID from an existing service principal

``` powershell
param (
    [Parameter(Mandatory=$true)]
    [string]
    $appName
)

$appId=$(az ad app list --display-name $appName --query [].appId -o tsv)
```

The --query flag will allow us to get the app ID that we need. -o tsv will return the value only. Without it, the application ID would be wrapped with quotes.

## Adding API permissions

Adding API permissions