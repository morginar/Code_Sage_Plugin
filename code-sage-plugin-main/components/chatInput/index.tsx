import React, { useState, useCallback } from 'react';
import styles from './style.less';
import { useIntl } from 'react-intl';
import sendIcon from '@assets/static/img/openAI/send.svg';
import sendDisabledIcon from '@assets/static/img/openAI/send_disabled.svg';
import { v4 as uuidv4 } from 'uuid';
import { useActiveEditor } from '@views/workspace/workspaceDetail/workbench/centerPane/editor/hooks/useActiveEditor';
import { openAIService } from '../../services/openAIService';
import { useDispatch } from 'react-redux';
import { OpenAIActions, OpenAIActionsTypes } from '../../actions';

interface IChatInputProps {
  disabled?: boolean;
}
export function ChatInput({ disabled = false }: IChatInputProps) {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { editor } = useActiveEditor();
  const [question, setQuestion] = useState('');

  const sendQuestion = useCallback(() => {
    if (!question) return;
    const newConversationId = uuidv4();
    dispatch(
      OpenAIActions.addConversationWithQuestion({
        conversationId: newConversationId,
        question: {
          scope: 'no_set',
          type: 'ai_command',
          content: question
        }
      })
    );
    openAIService.aiCommand(question);
    setQuestion('');
  }, [editor, question]);

  return (
    <div className={styles.chatInput}>
      <input
        disabled={disabled}
        value={question}
        onChange={(e) => {
          setQuestion(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendQuestion();
          }
        }}
        placeholder={formatMessage({ id: 'OPENAI_COMMAND_DESC' })}
      />
      <img
        onClick={sendQuestion}
        title="send"
        src={disabled ? sendDisabledIcon : sendIcon}
        width={17}
        height={17}
      />
    </div>
  );
}
