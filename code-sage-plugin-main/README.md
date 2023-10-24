## Code-Sage-Plugin
Source code of IDE Code Sage plugin.


## Plugin Project Structure

The 'extension.ts' is the entry file for the plugin, exposing three properties:

- activate: When the plugin is activated, this function is triggered with the following parameter:

  - ctx: Internal context of the plugin

- ide: Internal interface

  - ideProxyImpl: Plugin API
  - fileSystemService: File system API
  - terminalService: Terminal API

- deactivate: When the plugin is deactivated, this function is triggered.
- config: The plugin provides basic information, detailed in the PluginConfigurations type.


## API List

### Adding a Right Control Bar

```typescript
const { ideProxyImpl } = ide;

const addControl = ideProxyImpl.addControl({
  componentId: 'sample-component-id',
  componentFunc: Controls,
  name: 'right control',
  iconName: 'GroupObject'
});

ctx.subscriptions push(addControl);
```

### Setting a Welcome Page

```typescript
const setWelcomePage = ideProxyImpl.setWelcomePage({
  componentFunc: welcomePage,
  name: 'welcomePage',
  iconName: 'GroupObject'
});

ctx.subscriptions push(setWelcomePage);
```

### Registering a Command

```typescript
const setCommand =  ideProxyImpl.registerCommand({
    id: 'commandId',
    name: 'command',
    callback: <T>(data?: T) => void,
})

ctx.subscriptions push(setCommand)
```

### Registering a Function

```typescript
const registerFunction =  ideProxyImpl.registerFunction({
    name: 'functionName',
    function: <T>(data?: T) => void,
})

ctx.subscriptions push(registerFunction)
```

### File System

```typescript
// Example
// For more details, please read IFileSystemService
import { toUri } from '../libs/utils/toUri';
const { fileSystemService } = ide;

const currentProject = ideProxyImpl.currentProject;
const fileUri = toUri(currentProject.currentProjectId, fileName);

// Read file content
fileSystemService
    .readFileString(fileUri)
    .then((fileContent) => {
        console.log(fileContent);
    })
    .catch((e) => console.log(e));

// Listen to file changes
fileSystemService.onFileContentChange(({ uri }: IFilesystemContentChange) => {
    console.log(fileUri, uri);
    if (fileUri === uri) {
        // Do something when the file changes
    }
});
```

### Terminal Service

```typescript
const { terminalService } = ide;

// Open a terminal and input a command
terminalService.createTerminal('touch index.ts');
```