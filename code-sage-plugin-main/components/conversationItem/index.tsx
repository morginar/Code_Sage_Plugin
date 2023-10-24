import { useAppState } from '@modules/common/hooks/useAppState';
import React, { useCallback } from 'react';
import chatGPTIcon from '@assets/static/img/openAI/openAI-icon.svg';
import cn from 'classnames';
import {
  IOpenAIConversation,
  IOpenAIConversationQuestion
} from '../../actions';
import userIcon from '@assets/static/img/userIcon.svg';

import styles from './style.less';
import { getLocaleMsgFromKey } from '@modules/common/utils/notificationUtil';
import Markdown from '../markdown';
interface IConversationItemProps {
  item: IOpenAIConversation;
}
export function ConversationItem({ item }: IConversationItemProps) {
  const { user } = useAppState();

  const getConversationQuestionText = useCallback(
    (item: IOpenAIConversationQuestion) => {
      const { scope, type, content } = item;
      if (scope === 'no_set') {
        return content;
      } else if (scope === 'file') {
        if (type === 'add_comments') {
          return getLocaleMsgFromKey(
            'OPENAI_CONVERSATION_FILE_COMMENTATOR_QUESTION'
          );
        } else if (type === 'remove_comment') {
          return getLocaleMsgFromKey(
            'OPENAI_CONVERSATION_FILE_DECOMMENTATOR_QUESTION'
          );
        } else if (type === 'advisor') {
          return getLocaleMsgFromKey(
            'OPENAI_CONVERSATION_FILE_ADVISOR_QUESTION'
          );
        } else if (type === 'refactor') {
          return getLocaleMsgFromKey(
            'OPENAI_CONVERSATION_FILE_REFACTORER_QUESTION'
          );
        }
      } else if (scope === 'select_code') {
        if (type === 'add_comments') {
          return getLocaleMsgFromKey(
            'OPENAI_CONVERSATION_CODE_COMMENTATOR_QUESTION'
          );
        } else if (type === 'remove_comment') {
          return getLocaleMsgFromKey(
            'OPENAI_CONVERSATION_CODE_DECOMMENTATOR_QUESTION'
          );
        } else if (type === 'advisor') {
          return getLocaleMsgFromKey(
            'OPENAI_CONVERSATION_CODE_ADVISOR_QUESTION'
          );
        } else if (type === 'refactor') {
          return getLocaleMsgFromKey(
            'OPENAI_CONVERSATION_CODE_REFACTORER_QUESTION'
          );
        }
      }
    },
    []
  );

  const renderAnswer = useCallback(() => {
    if (!item.answer) return <></>;
    if (['remove_comment', 'add_comments'].includes(item.question.type)) {
      if (item.answer.isError) {
        return (
          <div className={styles.answer}>
            <div className={styles.header}>
              <div className={styles.icon}>
                <img width={16} src={chatGPTIcon} />
              </div>
              <div className={styles.title}>ide Code Sage</div>
            </div>
            <div style={{ color: '#FF8C00', paddingLeft: '32px' }}>
              {item.answer.content}
            </div>
          </div>
        );
      } else {
        return <></>;
      }
    } else {
      return (
        <div className={styles.answer}>
          <div className={styles.header}>
            <div className={styles.icon}>
              <img width={16} src={chatGPTIcon} />
            </div>
            <div className={styles.title}>ide Code Sage</div>
          </div>
          {item.answer.isError ? (
            <div style={{ color: '#FF8C00', paddingLeft: '32px' }}>
              {item.answer.content}
            </div>
          ) : (
            <Markdown>{item.answer.content || ''}</Markdown>
          )}
        </div>
      );
    }
  }, [item.answer, item.question.type]);

  return (
    <div className={styles.conversationItem}>
      <div className={styles.question}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <img width={16} src={user.avatar || userIcon} />
          </div>
          <div className={styles.title}>{user.username || 'You'}</div>
        </div>

        <div className={cn(styles.content)}>
          {getConversationQuestionText(item.question)}
          <span className={item.conversationLoading ? styles.ellipsis : ''} />
        </div>
      </div>

      {renderAnswer()}
    </div>
  );
}
