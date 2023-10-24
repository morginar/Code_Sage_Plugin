import React from 'react';
import styles from './styles.less';
import { DirectionalHint, TooltipHost } from 'office-ui-fabric-react';
import { Button, ButtonType } from '@modules/common/components';
import { useProjectState } from '@modules/projects/hooks/useProjectState';
import {
  ProjectActions,
  PanesActions,
  PanesContentType
} from '@modules/common';
import { useDispatch } from 'react-redux';
import { usePanesState } from '@views/workspace/workspaceDetail/workbench/hooks/usePanesState';

import pluginIcon from '@assets/static/img/openAI/openAI-icon.svg';

export function OpenAIButton() {
  const dispatch = useDispatch();
  const { right, layout } = usePanesState();
  const { projectRightPanelFocusTabKey } = useProjectState();

  const _toggleControl = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, key: string) => {
      if (event) {
        event.preventDefault();
      }
      dispatch(ProjectActions.setProjectRightPanelFocusTabKey(key));
      if (layout.right === 0) {
        dispatch(PanesActions.togglePane(PanesContentType.CONTROL, key));
        dispatch(
          PanesActions.updateLayout({
            ...layout,
            right: 300
          })
        );
      } else {
        if (key !== right?.key) {
          dispatch(PanesActions.togglePane(PanesContentType.CONTROL, key));
        } else {
          dispatch(PanesActions.closePane(PanesContentType.CONTROL));
        }
      }
    },
    [dispatch, layout, right?.key]
  );

  return (
    <div className={styles.openAIButton}>
      <TooltipHost
        content="ide Code Sage"
        styles={{
          root: { display: 'inline-block', width: '100%' }
        }}
        directionalHint={DirectionalHint.leftCenter}>
        <Button
          checked={projectRightPanelFocusTabKey === 'ide-code-sage'}
          className="controls0"
          eventType="RIGHT_DEPLOY&INTERACT"
          type={ButtonType.RIGHT_CONTROL_BUTTON}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            _toggleControl(e, 'ide-code-sage');
          }}>
          <img width={24} src={pluginIcon} />
        </Button>
      </TooltipHost>
    </div>
  );
}
