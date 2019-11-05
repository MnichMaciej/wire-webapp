/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import ko from 'knockout';

import {ConversationRepository} from 'src/script/conversation/ConversationRepository';
import {Conversation} from 'src/script/entity/Conversation';
import {ConversationListViewModel} from 'src/script/view_model/list/ConversationListViewModel';
import {
  ConversationLabel,
  createLabel,
  createLabelFavorites,
  createLabelGroups,
  createLabelPeople,
} from '../../conversation/ConversationLabelRepository';
import {generateConversationUrl} from '../../router/routeGenerator';

interface ConversationLabelWithBadge extends ConversationLabel {
  badge: number;
}

interface GroupedConversationsParams {
  conversationRepository: ConversationRepository;
  listViewModel: ConversationListViewModel;
  hasJoinableCall: (conversationId: string) => boolean;
  onJoinCall: (conversationEntity: Conversation) => void;
  isSelectedConversation: (conversationEntity: Conversation) => boolean;
  expandedFolders: ko.ObservableArray<string>;
  isVisibleFunc: (top: number, bottom: number) => boolean;
}

const countUnread = (conversations: Conversation[]) =>
  conversations.filter(({unreadState}) => unreadState().allEvents.length > 0).length;

ko.components.register('grouped-conversations', {
  template: `
    <!-- ko foreach: {data: folders, as: 'folder', noChildContext: true} -->
      <div class="conversation-folder" data-uie-name="conversation-folder" data-bind="attr: {'data-uie-value': folder.name}">
        <div class="conversation-folder__head" data-uie-name="conversation-folder-head" data-bind="click: () => toggle(folder.id), css: {'conversation-folder__head--open': isExpanded(folder.id)}">
          <disclose-icon></disclose-icon><span class="conversation-folder__head__name" data-bind="text: folder.name"></span>
          <!-- ko if: folder.badge -->
            <span class="conversation-folder__head__badge" data-bind="text: folder.badge" data-uie-name="conversation-folder-badge"></span>
          <!-- /ko -->
        </div>
        <div data-bind="visible: isExpanded(folder.id)">
          <!-- ko foreach: {data: folder.conversations, as: 'conversation', noChildContext: true} -->
            <conversation-list-cell
              data-bind="link_to: getConversationUrl(conversation.id), event: {'contextmenu': (_, event) => listViewModel.onContextMenu(conversation, event)}"
              data-uie-name="item-conversation"
              params="click: (_, event) => listViewModel.onContextMenu(conversation, event), conversation: conversation, showJoinButton: hasJoinableCall(conversation.id), is_selected: isSelectedConversation, onJoinCall: onJoinCall,offsetTop: getOffsetTop(folder, conversation), index: $index, isVisibleFunc: isVisibleFunc">
            </conversation-list-cell>
          <!-- /ko -->
        </div>
      </div>
    <!-- /ko -->
  `,
  viewModel: function({
    conversationRepository,
    listViewModel,
    hasJoinableCall,
    onJoinCall,
    isSelectedConversation,
    expandedFolders = ko.observableArray([]),
    isVisibleFunc = () => false,
  }: GroupedConversationsParams): void {
    const {conversationLabelRepository} = conversationRepository;
    this.listViewModel = listViewModel;
    this.hasJoinableCall = hasJoinableCall;
    this.onJoinCall = onJoinCall;
    this.isSelectedConversation = isSelectedConversation;
    this.getConversationUrl = generateConversationUrl;
    this.isVisibleFunc = isVisibleFunc;

    this.folders = ko.pureComputed<ConversationLabelWithBadge[]>(() => {
      const folders: ConversationLabelWithBadge[] = [];

      const favorites = conversationLabelRepository.getFavorites();
      if (favorites.length) {
        folders.push({...createLabelFavorites(favorites), badge: countUnread(favorites)});
      }

      const groups = conversationLabelRepository.getGroupsWithoutLabel();
      if (groups.length) {
        folders.push({...createLabelGroups(groups), badge: countUnread(groups)});
      }

      const contacts = conversationLabelRepository.getContactsWithoutLabel();
      if (contacts.length) {
        folders.push({...createLabelPeople(contacts), badge: countUnread(contacts)});
      }

      const custom = conversationLabelRepository
        .getLabels()
        .map(label => {
          const conversations = conversationLabelRepository.getLabelConversations(label);
          return {...createLabel(label.name, conversations, label.id), badge: countUnread(conversations)};
        })
        .filter(({conversations}) => !!conversations().length);
      folders.push(...custom);

      return folders;
    });
    this.isExpanded = (folderId: string): boolean => expandedFolders().includes(folderId);
    this.toggle = (folderId: string): void => {
      if (this.isExpanded(folderId)) {
        expandedFolders.remove(folderId);
      } else {
        expandedFolders.push(folderId);
      }
    };

    /*
     *  We need to calculate the offset from the top for the isVisibleFunc as we can't rely
     *  on the index of the conversation alone. We need to account for the folder headers and
     *  the height of the <conversation-list-cell>s of the previous open folders.
     */
    this.getOffsetTop = (folder: ConversationLabel, conversation: Conversation) => {
      const folderHeaderHeight = 53;
      const firstFolderHeaderHeight = 33;
      const cellHeight = 56;

      const folders = this.folders() as ConversationLabel[];
      const folderIndex = folders.indexOf(folder);
      const totalHeaderHeight = folderHeaderHeight * folderIndex + firstFolderHeaderHeight;
      const previousExpandedFolders = folders.slice(0, folderIndex).filter(({id}) => this.isExpanded(id));
      const previousCellsHeight = previousExpandedFolders.reduce(
        (height, {conversations}) => height + conversations.length * cellHeight,
        0,
      );
      const currentCellsHeight = folder.conversations.indexOf(conversation) * cellHeight;
      return totalHeaderHeight + previousCellsHeight + currentCellsHeight;
    };
  },
});
