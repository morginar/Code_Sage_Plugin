import produce from 'immer';
import {
  IOpenAIConversation,
  IOpenAIActions,
  OpenAIActionsTypes,
  OpenAIFileActionButtonType
} from '../actions';
import {
  EStorageKeys,
  safeObjectJsonParse
} from '@modules/common/utils/common';
import { localStorageUtil } from '@modules/common/utils/storage';
import { getLocaleMsgFromKey } from '@modules/common/utils/notificationUtil';

export const OPENAI_SOCKET_END_SYMBOL = '[DONE]';

export interface IOpenAIState {
  conversationList: IOpenAIConversation[];
  activeFileActionButton: OpenAIFileActionButtonType;
}

export const initialState: IOpenAIState = {
  conversationList: [],
  activeFileActionButton: ''
};

export default function openAIReducer(
  state: IOpenAIState = initialState,
  action: IOpenAIActions
) {
  switch (action.type) {
    case OpenAIActionsTypes.ADD_CONVERSATION_WITH_QUESTION: {
      return produce(state, (draft) => {
        draft.conversationList.push({
          ...action.data,
          conversationLoading: true
        });
      });
    }

    case OpenAIActionsTypes.UPDATE_CONVERSATION_ANSWER: {
      return produce(state, (draft) => {
        const { conversationId, answer } = action.data;
        const item = draft.conversationList.find(
          (item) => item.conversationId === conversationId
        );
        if (!item) return;

        const isDone = answer.content === OPENAI_SOCKET_END_SYMBOL;
        let newContent = '';
        if (!isDone) {
          newContent = JSON.parse(answer.content || '{}').content || '';
        }
        if (isDone) {
          item.conversationLoading = false;
          draft.activeFileActionButton = '';
          return;
        }

        const errorCode = safeObjectJsonParse(answer.content).errorCode;
        const isError = !!errorCode;
        if (isError) {
          item.conversationLoading = false;
          draft.activeFileActionButton = '';
          item.answer = {
            isError: true,
            content: getErrorContent(errorCode)
          };
          return;
        }

        if (answer.isError) {
          item.answer = answer;
          item.conversationLoading = false;
        } else {
          item.answer = {
            isError: false,
            content: `${item.answer?.content || ''}${newContent}`
          };
        }
      });
    }

    case OpenAIActionsTypes.REMOVE_CONVERSATIONS: {
      return produce(state, (draft) => {
        draft.conversationList = [];
      });
    }

    case OpenAIActionsTypes.UPDATE_FILE_ACTION_BUTTON: {
      return produce(state, (draft) => {
        draft.activeFileActionButton = action.data;
      });
    }
    default:
      return state;
  }
}

function getErrorContent(errorCode: string) {
  const isLogin = !!localStorageUtil.syncGet(EStorageKeys.ACCESS_TOKEN);
  const openAIErrorCodeMapMessage: Record<string, string> = {
    '4XXC1': getLocaleMsgFromKey('OPENAI_TOKEN_DAILY_USAGE_LIMIT_REACHED'),
    '4XXC2': getLocaleMsgFromKey('OPENAI_TOKEN_MONTHLY_USAGE_LIMIT_REACHED'),
    '4XXC3': getLocaleMsgFromKey('OPENAI_TOKEN_SINGLE_REQUEST_LIMIT_REACHED'),
    '4XXC4': getLocaleMsgFromKey(
      isLogin
        ? 'OPENAI_TOKEN_USER_MONTHLY_USAGE_LIMIT_REACHED'
        : 'OPENAI_TOKEN_GUEST_USER_MONTHLY_USAGE_LIMIT_REACHED'
    ),
    '5XXC1': getLocaleMsgFromKey('OPENAI_TIMEOUT')
  };
  return openAIErrorCodeMapMessage[errorCode] || '';
}
