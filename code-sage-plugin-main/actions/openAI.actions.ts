import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
export type OpenAIConversationQuestionType =
  | 'remove_comment'
  | 'add_comments'
  | 'advisor'
  | 'refactor'
  | 'ai_command';
export type OpenAIFileActionButtonType =
  | 'BUTTON_REMOVE_COMMENTS'
  | 'BUTTON_ADD_COMMENTS'
  | 'BUTTON_ADVISOR'
  | 'BUTTON_REFACTOR'
  | '';
type OpenAIConversationQuestionScope = 'select_code' | 'file' | 'no_set';
export interface IOpenAIConversationQuestion {
  scope: OpenAIConversationQuestionScope;
  type: OpenAIConversationQuestionType;
  content: string;
  range?: monaco.Selection;
}
export interface IOpenAIConversationAnswer {
  isError?: boolean;
  content?: string;
}
export interface IOpenAIConversation {
  conversationId: string;
  conversationLoading: boolean;
  question: IOpenAIConversationQuestion;
  answer?: IOpenAIConversationAnswer;
}

export enum OpenAIActionsTypes {
  ADD_CONVERSATION_WITH_QUESTION = 'ADD_CONVERSATION_WITH_QUESTION',
  UPDATE_CONVERSATION_ANSWER = 'UPDATE_CONVERSATION_ANSWER',
  REMOVE_CONVERSATIONS = 'REMOVE_CONVERSATIONS',
  UPDATE_FILE_ACTION_BUTTON = 'UPDATE_FILE_ACTION_BUTTON'
}

interface IAddConversationWithQuestionParam {
  conversationId: string;
  question: IOpenAIConversationQuestion;
}
interface IUpdateConversationAnswerParam {
  conversationId: string;
  answer: IOpenAIConversationAnswer;
}
export interface IAddConversationWithQuestion {
  type: typeof OpenAIActionsTypes.ADD_CONVERSATION_WITH_QUESTION;
  data: IAddConversationWithQuestionParam;
}

export interface IUpdateConversationAnswer {
  type: typeof OpenAIActionsTypes.UPDATE_CONVERSATION_ANSWER;
  data: IUpdateConversationAnswerParam;
}

export interface IRemoveConversations {
  type: typeof OpenAIActionsTypes.REMOVE_CONVERSATIONS;
}

export interface IUpdateFileActionButton {
  type: typeof OpenAIActionsTypes.UPDATE_FILE_ACTION_BUTTON;
  data: OpenAIFileActionButtonType;
}

export const OpenAIActions = {
  addConversationWithQuestion: function (
    data: IAddConversationWithQuestionParam
  ) {
    return {
      type: OpenAIActionsTypes.ADD_CONVERSATION_WITH_QUESTION,
      data
    };
  },

  updateConversationAnswer: function (data: IUpdateConversationAnswerParam) {
    return {
      type: OpenAIActionsTypes.UPDATE_CONVERSATION_ANSWER,
      data
    };
  },

  removeConversations: function () {
    return {
      type: OpenAIActionsTypes.REMOVE_CONVERSATIONS
    };
  },

  updateFileActionButton: function (data: OpenAIFileActionButtonType) {
    return {
      type: OpenAIActionsTypes.UPDATE_FILE_ACTION_BUTTON,
      data
    };
  }
};

export type IOpenAIActions =
  | IAddConversationWithQuestion
  | IUpdateConversationAnswer
  | IRemoveConversations
  | IUpdateFileActionButton;
