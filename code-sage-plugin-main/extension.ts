import { Controls } from './components/control';
import { PluginType, Plugin, PluginContext } from '@modules/extensions/types';
import ide from '@modules/extensions/client/ideProxyImpl';
import icon from '@assets/static/img/pluginIcon/active/ide-openAI.svg';

import inactiveIcon from '@assets/static/img/pluginIcon/inactive/ide-openAI.svg';
import { OpenAIButton } from './components/openAIButton';

export const pluginConfig: Plugin = {
  activate(ctx: PluginContext) {
    const addControl = ide.addControl({
      componentId: 'ide-code-sage',
      componentFunc: Controls,
      name: 'IDE Code Sage',
      iconName: 'OfficeChat',
      customButton: OpenAIButton
    });

    ctx.subscriptions.push(addControl);
  },
  deactivate(_ctx: PluginContext) {
    console.log('deactivate plugin');
  },
  config: {
    pluginId: 'IDE-Code-Sage',
    version: '0.0.1',
    type: PluginType.view,
    active: true,
    description: {
      title: 'ide Code Sage',
      icon,
      inactiveIcon,
      description:
        'ide Code Sage is an innovative development tool plugin designed to enhance the coding experience by providing intelligent assistance throughout the software development process.'
    }
  },
  store: undefined,
  context: {
    subscriptions: []
  }
};
