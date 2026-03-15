/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { StorageManager } from './StorageManager';
import { StoryFull, UserPreferences, DEFAULT_PREFERENCES } from '../types';

// ---------------------------------------------------------------------------
// Minimal fixtures
// ---------------------------------------------------------------------------

const STORY_FIXTURE: StoryFull = {
  title: 'Hero Test Tale',
  parts: [{ text: 'Once upon a time…', choices: [], partIndex: 0 }],
  vocabWord: { word: 'brave', definition: 'Ready to face danger without fear.' },
  joke: 'Why did the hero sit on a clock? To be on time!',
  lesson: 'Courage matters.',
  tomorrowHook: 'What happens next…',
  rewardBadge: { emoji: '🏆', title: 'Hero Badge', description: 'You are brave!' },
};

const PREFS_FIXTURE: UserPreferences = {
  ...DEFAULT_PREFERENCES,
  fontSize: 'large',
  isMuted: true,
};

// ---------------------------------------------------------------------------
// IDBFactory / IDBDatabase stub (happy-dom provides a real IDB implementation
// so we exercise the real async paths here — no manual mock required).
// ---------------------------------------------------------------------------

describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    // Each test gets a fresh IDBFactory so state doesn't leak between tests.
    // We inject it into globalThis so StorageManager's `indexedDB.open()`
    // calls resolve against the in-memory implementation.
    globalThis.indexedDB = new IDBFactory();
    manager = new StorageManager();
  });

  afterEach(() => {
    // Reset the global to avoid state leaking to other test suites.
    globalThis.indexedDB = undefined as unknown as IDBFactory;
  });

  // -------------------------------------------------------------------------
  // init
  // -------------------------------------------------------------------------

  describe('init', () => {
    it('should initialise without error', async () => {
      await expect(manager.init()).resolves.toBeUndefined();
    });

    it('should be idempotent — calling init twice does not throw', async () => {
      await manager.init();
      await expect(manager.init()).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Preferences
  // -------------------------------------------------------------------------

  describe('savePreferences / getPreferences', () => {
    it('should return DEFAULT_PREFERENCES when no prefs are saved', async () => {
      const prefs = await manager.getPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });

    it('should persist and retrieve custom preferences', async () => {
      await manager.savePreferences(PREFS_FIXTURE);
      const retrieved = await manager.getPreferences();
      expect(retrieved).toEqual(PREFS_FIXTURE);
    });

    it('should overwrite previously saved preferences', async () => {
      await manager.savePreferences(PREFS_FIXTURE);
      const updated: UserPreferences = { ...PREFS_FIXTURE, isMuted: false };
      await manager.savePreferences(updated);
      const retrieved = await manager.getPreferences();
      expect(retrieved.isMuted).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Stories — save / get
  // -------------------------------------------------------------------------

  describe('saveStory / getAllStories', () => {
    it('should persist a story and return it in getAllStories', async () => {
      await manager.saveStory(STORY_FIXTURE);
      const stories = await manager.getAllStories();
      expect(stories).toHaveLength(1);
      expect(stories[0].story.title).toBe('Hero Test Tale');
    });

    it('should return a string id after saving', async () => {
      const id = await manager.saveStory(STORY_FIXTURE);
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should store avatar url when provided', async () => {
      const avatar = 'data:image/png;base64,ABC123';
      await manager.saveStory(STORY_FIXTURE, avatar);
      const [entry] = await manager.getAllStories();
      expect(entry.avatar).toBe(avatar);
    });

    it('should return stories sorted by newest first', async () => {
      await manager.saveStory({ ...STORY_FIXTURE, title: 'Older Story' });
      // Small delay to ensure a different timestamp
      await new Promise((r) => setTimeout(r, 5));
      await manager.saveStory({ ...STORY_FIXTURE, title: 'Newer Story' });

      const stories = await manager.getAllStories();
      expect(stories[0].story.title).toBe('Newer Story');
      expect(stories[1].story.title).toBe('Older Story');
    });

    it('should return an empty array when no stories exist', async () => {
      const stories = await manager.getAllStories();
      expect(stories).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Stories — delete
  // -------------------------------------------------------------------------

  describe('deleteStory', () => {
    it('should remove a story from storage', async () => {
      const id = await manager.saveStory(STORY_FIXTURE);
      await manager.deleteStory(id);
      const stories = await manager.getAllStories();
      expect(stories).toHaveLength(0);
    });

    it('should not affect other stories when one is deleted', async () => {
      const id1 = await manager.saveStory({ ...STORY_FIXTURE, title: 'Keep Me' });
      const id2 = await manager.saveStory({ ...STORY_FIXTURE, title: 'Delete Me' });
      await manager.deleteStory(id2);
      const stories = await manager.getAllStories();
      expect(stories).toHaveLength(1);
      expect(stories[0].id).toBe(id1);
    });
  });

  // -------------------------------------------------------------------------
  // Stories — scene updates
  // -------------------------------------------------------------------------

  describe('saveStoryScene', () => {
    it('should attach a scene image to an existing story', async () => {
      const id = await manager.saveStory(STORY_FIXTURE);
      await manager.saveStoryScene(id, 0, 'data:image/png;base64,SCENE');

      const [entry] = await manager.getAllStories();
      expect(entry.scenes?.[0]).toBe('data:image/png;base64,SCENE');
    });

    it('should reject with an error when story id is not found', async () => {
      await expect(
        manager.saveStoryScene('non-existent-id', 0, 'data:image/png;base64,X')
      ).rejects.toThrow('Story not found for scene update');
    });

    it('should allow multiple scenes for different part indices', async () => {
      const id = await manager.saveStory(STORY_FIXTURE);
      await manager.saveStoryScene(id, 0, 'scene0');
      await manager.saveStoryScene(id, 1, 'scene1');

      const [entry] = await manager.getAllStories();
      expect(entry.scenes?.[0]).toBe('scene0');
      expect(entry.scenes?.[1]).toBe('scene1');
    });
  });

  // -------------------------------------------------------------------------
  // Stories — feedback
  // -------------------------------------------------------------------------

  describe('updateFeedback', () => {
    it('should save feedback on an existing story', async () => {
      const id = await manager.saveStory(STORY_FIXTURE);
      await manager.updateFeedback(id, 5, 'Amazing story!');

      const [entry] = await manager.getAllStories();
      expect(entry.feedback?.rating).toBe(5);
      expect(entry.feedback?.text).toBe('Amazing story!');
      expect(entry.feedback?.timestamp).toBeGreaterThan(0);
    });

    it('should reject with an error when story id is not found', async () => {
      await expect(
        manager.updateFeedback('non-existent-id', 3, 'ok')
      ).rejects.toThrow('Story not found');
    });
  });

  // -------------------------------------------------------------------------
  // Audio cache
  // -------------------------------------------------------------------------

  describe('saveAudio / getAudio', () => {
    it('should persist and retrieve an ArrayBuffer by key', async () => {
      const buffer = new TextEncoder().encode('audio-data').buffer as ArrayBuffer;
      await manager.saveAudio('voice:test', buffer);
      const retrieved = await manager.getAudio('voice:test');
      expect(retrieved).toBeDefined();
      expect(new TextDecoder().decode(retrieved as ArrayBuffer)).toBe('audio-data');
    });

    it('should return undefined for a key that has not been saved', async () => {
      const result = await manager.getAudio('missing-key');
      expect(result).toBeUndefined();
    });

    it('should overwrite audio when the same key is saved twice', async () => {
      const first = new TextEncoder().encode('first').buffer as ArrayBuffer;
      const second = new TextEncoder().encode('second').buffer as ArrayBuffer;
      await manager.saveAudio('key', first);
      await manager.saveAudio('key', second);
      const retrieved = await manager.getAudio('key');
      expect(new TextDecoder().decode(retrieved as ArrayBuffer)).toBe('second');
    });
  });
});
