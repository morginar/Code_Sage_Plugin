import { useActiveEditor } from '@views/workspace/workspaceDetail/workbench/centerPane/editor/hooks/useActiveEditor';
import React, {
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import cn from 'classnames';
import { useUnmount, useUpdate } from 'react-use';
import openAIIcon from '@assets/static/img/openAI/openAI-logo.svg';
import chatGPTIcon from '@assets/static/img/openAI/openAI-icon.svg';

import styles from './styles.less';
import { Button, ButtonType } from '@modules/common/components';
import { DirectionalHint, TooltipHost } from 'office-ui-fabric-react';
import { openAIService } from '@modules/extensions/internalPlugins/openAI/services/openAIService';
import { useActiveFile } from '@views/workspace/workspaceDetail/workbench/centerPane/tabs/useActiveTab';
import { useProjectState } from '@modules/projects/hooks/useProjectState';
import { useDispatch, useSelector } from 'react-redux';
import { IStateTypes } from '@store/types';
import {
  OpenAIActions,
  OpenAIConversationQuestionType,
  OpenAIFileActionButtonType
} from '../actions';
import { useIntl } from 'react-intl';
import { v4 as uuidv4 } from 'uuid';
import { ConversationItem } from './conversationItem';
import { localStorageUtil } from '@modules/common/utils/storage/localStorage';
import {
  EStorageKeys,
  getFirstCodeBlockContent
} from '@modules/common/utils/common';
import { envConfig } from '@modules/common/const/envs';
import { ChatInput } from './chatInput';
import { OPENAI_SOCKET_END_SYMBOL } from '../reducers/openAI.reducer';

const OPENAI_WHOLE_FILE_RANGE = {
  startLineNumber: 0,
  startColumn: 0,
  endColumn: 10000,
  endLineNumber: 10000
};

export function Controls() {
  const dispatch = useDispatch();
  const { editor } = useActiveEditor();
  const { conversationList, activeFileActionButton } = useSelector(
    (state: IStateTypes) => state.openAI
  );
  const conversationListLoading = useMemo(
    () => !!conversationList.find((item) => item.conversationLoading === true),
    [conversationList]
  );
  const { currentProjectId = '' } = useProjectState();
  const { activeFileContent } = useActiveFile();
  const conversationRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const update = useUpdate();
  const { formatMessage } = useIntl();

  useUnmount(() => {
    editor?.removeOldOpenAIForEditor();
  });

  useEffect(() => {
    editor?.addOpenAIForEditor();
  }, [editor]);

  const handleButtonClick = useCallback(
    (
      type: OpenAIConversationQuestionType,
      service: (code: string, fileType: string) => void,
      buttonType: OpenAIFileActionButtonType
    ) => {
      if (!editor || !activeFileContent) return;
      const newConversationId = uuidv4();
      const editContent = editor?.getEditorContent() || '';
      dispatch(OpenAIActions.updateFileActionButton(buttonType));
      dispatch(
        OpenAIActions.addConversationWithQuestion({
          conversationId: newConversationId,
          question: {
            type,
            scope: 'file',
            content: editContent
          }
        })
      );
      service(editContent, editor.getFileExt());
    },
    [activeFileContent, dispatch, editor]
  );

  const chatGPTButtonList = [
    {
      content: formatMessage({ id: 'OPENAI_BUTTON_COMMENTATOR' }),
      tooltip: formatMessage({ id: 'OPENAI_BUTTON_COMMENTATOR_LABEL' }),
      type: 'BUTTON_ADD_COMMENTS',
      onclick: () => {
        handleButtonClick(
          'add_comments',
          openAIService.addComments,
          'BUTTON_ADD_COMMENTS'
        );
      }
    },
    {
      content: formatMessage({ id: 'OPENAI_BUTTON_DECOMMENTATOR' }),
      tooltip: formatMessage({ id: 'OPENAI_BUTTON_DECOMMENTATOR_LABEL' }),
      type: 'BUTTON_REMOVE_COMMENTS',
      onclick: () => {
        handleButtonClick(
          'remove_comment',
          openAIService.removeComments,
          'BUTTON_REMOVE_COMMENTS'
        );
      }
    },
    {
      content: formatMessage({ id: 'OPENAI_BUTTON_ADVISOR' }),
      tooltip: formatMessage({ id: 'OPENAI_BUTTON_ADVISOR_LABEL' }),
      type: 'BUTTON_ADVISOR',
      onclick: () => {
        handleButtonClick(
          'advisor',
          openAIService.optiSuggest,
          'BUTTON_ADVISOR'
        );
      }
    },
    {
      content: formatMessage({ id: 'OPENAI_BUTTON_REFACTORER' }),
      tooltip: formatMessage({ id: 'OPENAI_BUTTON_REFACTORER_LABEL' }),
      type: 'BUTTON_REFACTOR',
      onclick: () => {
        handleButtonClick(
          'refactor',
          openAIService.checkCodeQuality,
          'BUTTON_REFACTOR'
        );
      }
    }
  ];

  useEffect(() => {
    update();
    if (!conversationRef.current) return;
    const container = conversationRef.current;
    container.scrollTop = container.scrollHeight - container.offsetHeight;
    if (conversationRef.current.offsetWidth !== 0) {
      setContainerWidth(conversationRef.current.offsetWidth);
    }
  }, [
    conversationList,
    conversationRef.current?.scrollHeight,
    conversationRef.current?.offsetWidth,
    conversationRef.current?.offsetHeight,
    update
  ]);

  useUnmount(() => {
    dispatch(OpenAIActions.removeConversations());
  });

  useEffect(() => {
    if (!editor) return;
    const addConversationWithQuestionEvent =
      editor.onOpenAIConversationAddWithQuestionEvent(({ data }) => {
        dispatch(OpenAIActions.addConversationWithQuestion(data));
      });
    const addConversationAnswerEvent =
      editor.onOpenAIConversationAddAnswerEvent(({ data }) => {
        dispatch(OpenAIActions.updateConversationAnswer(data));
      });
    return () => {
      addConversationWithQuestionEvent.dispose();
      addConversationAnswerEvent.dispose();
    };
  }, [conversationList, currentProjectId, dispatch, editor]);

  const isSmallContainer = useMemo(() => {
    return containerWidth <= 300;
  }, [containerWidth]);

  const currentConversation = useMemo(() => {
    const conversationLength = conversationList.length;
    if (conversationLength === 0) return null;
    return conversationList[conversationLength - 1];
  }, [conversationList]);

  const [isSocketOpen, setSocketOpen] = useState(false);
  const disableOtherAction = useMemo(
    () => currentConversation?.conversationLoading || !isSocketOpen,
    [currentConversation?.conversationLoading, isSocketOpen]
  );
  useEffect(() => {
    if (!editor) return;
    editor.changeOpenAIActionEnableStatus(!disableOtherAction);
  }, [disableOtherAction, editor]);

  const connectSocket = useCallback(() => {
    const accessToken = localStorageUtil.syncGet(EStorageKeys.ACCESS_TOKEN);
    const websocketBaseUrl = `wss://${envConfig.apiDomain}/websocket/openai${
      accessToken ? `?jwt=${accessToken}` : ''
    }`;
    openAIService.socket.open(websocketBaseUrl, 10);
  }, []);
  useEffect(() => {
    connectSocket();
    return () => {
      openAIService.socket.close();
    };
  }, [connectSocket]);

  useEffect(() => {
    const event = openAIService.socket.onWebsocketStatusChange((e) => {
      console.log('openai websocket status change to', e.type);
      setSocketOpen(e.type === 'open');
      if (e.type === 'close') {
        connectSocket();
      }
    });
    return () => {
      event.dispose();
    };
  }, [connectSocket]);

  useEffect(() => {
    if (isSocketOpen) {
      // receive message
      openAIService.socket.onReceive((data: string) => {
        if (!currentConversation) return;
        if (data === OPENAI_SOCKET_END_SYMBOL && editor?.editorIns) {
          const {
            type: questionType,
            scope: questionScope,
            range: questionRange
          } = currentConversation.question;
          const { content: answerContent } = currentConversation.answer || {};
          if (!answerContent) return;
          const code = getFirstCodeBlockContent(answerContent);
          if (['remove_comment', 'add_comments'].includes(questionType)) {
            if (questionScope === 'file') {
              editor.editorIns.executeEdits('', [
                {
                  range: OPENAI_WHOLE_FILE_RANGE,
                  text: code,
                  forceMoveMarkers: true
                }
              ]);
            }
            if (questionScope === 'select_code' && questionRange) {
              editor.editorIns.executeEdits('', [
                {
                  range: questionRange,
                  text: code,
                  forceMoveMarkers: true
                }
              ]);
            }

            editor.editorIns
              .getAction('editor.action.formatDocument')
              .run()
              .catch(console.error);
          }
        }
        dispatch(
          OpenAIActions.updateConversationAnswer({
            conversationId: currentConversation.conversationId,
            answer: {
              isError: false,
              content: data
            }
          })
        );
      });
    }
  }, [currentConversation, dispatch, isSocketOpen, editor?.editorIns]);

  return (
    <div className={styles.openAIControls}>
      <div className={styles.chatGPT}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <img width={20} src={chatGPTIcon} />
          </div>
          <div className={styles.title}>
            {formatMessage({ id: 'OPENAI_CONTROL_TITLE' })}
          </div>
        </div>
        <div className={styles.content}>
          <div
            className={cn(styles.buttonBox, {
              [styles.buttonContainer]:
                containerWidth < 300 && containerWidth !== 0
            })}
          >
            {chatGPTButtonList.map((item, index) => (
              <div className={styles.itemButton} key={index}>
                <TooltipHost
                  content={item.tooltip}
                  calloutProps={{ styles: { root: { padding: '10px' } } }}
                  styles={{
                    root: {
                      display: 'inline-block',
                      width: '100%'
                    }
                  }}
                  directionalHint={DirectionalHint.topCenter}
                >
                  <Button
                    className={styles.chatGPTButton}
                    disabled={
                      conversationListLoading ||
                      !activeFileContent ||
                      !isSocketOpen
                    }
                    loading={item.type === activeFileActionButton}
                    loadingFontSize={isSmallContainer ? '12px' : '13px'}
                    type={ButtonType.PRIMARY}
                    styles={{
                      root: {
                        selectors: {
                          '.ms-Button-label': {
                            fontSize: isSmallContainer ? '12px' : '13px',
                            scale: '0.9',
                            marginLeft: '-3px'
                          }
                        }
                      }
                    }}
                    onClick={item.onclick}
                  >
                    {item.content}
                  </Button>
                </TooltipHost>
              </div>
            ))}
            <span className={styles.copywriter}></span>
          </div>
          <div className={styles.copywriter}>
            <img src={openAIIcon} width={14} />
            <span>Powered by OpenAI</span>
          </div>
        </div>
      </div>

      <div className={styles.conversation} ref={conversationRef}>
        {conversationList.map((item) => (
          <ConversationItem key={item.conversationId} item={item} />
        ))}
      </div>

      <ChatInput disabled={disableOtherAction} />
    </div>
  );
}
