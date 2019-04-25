/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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

import {resolve, graph} from './../../api/testResolver';
import {createRandomUuid} from 'utils/util';
import {StorageKey} from 'src/script/storage/StorageKey';

describe('CacheRepository', () => {
  const cache_repository = resolve(graph.CacheRepository);
  const TEMP_KEY = 'should_be_deleted';

  describe('clearCache', () => {
    beforeEach(() => {
      cache_repository.clearCache();

      const conversationInputKey = `${StorageKey.CONVERSATION.INPUT}|${createRandomUuid()}`;
      amplify.store(conversationInputKey, {mentions: [], reply: {}, text: 'test'});
      amplify.store(StorageKey.AUTH.SHOW_LOGIN, true);
      amplify.store(TEMP_KEY, true);
    });

    it('deletes cached keys', () => {
      const deleted_keys = cache_repository.clearCache(false);

      expect(deleted_keys.length).toBe(2);
    });

    it('preserves cached conversation inputs while deleting other keys', () => {
      const deleted_keys = cache_repository.clearCache(true);

      expect(deleted_keys.length).toBe(1);
      expect(deleted_keys[0]).toBe(TEMP_KEY);
    });
  });
});
