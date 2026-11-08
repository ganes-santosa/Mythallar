import { describe, it, expect } from 'vitest';
import {
  sanitizeRichNoteHtml,
  extractPlainTextFromHtml,
  isNoteContentEmpty,
} from './richNoteUtils';

describe('richNoteUtils', () => {
  describe('sanitizeRichNoteHtml', () => {
    it('preserves bold, italic, underline, and strikethrough tags', () => {
      const input = '<b>Bold</b> and <i>Italic</i> and <u>Underline</u> and <s>Strike</s> and <del>Deleted</del>';
      const output = sanitizeRichNoteHtml(input);
      expect(output).toContain('<b>Bold</b>');
      expect(output).toContain('<i>Italic</i>');
      expect(output).toContain('<u>Underline</u>');
      expect(output).toContain('<s>Strike</s>');
      expect(output).toContain('<del>Deleted</del>');
    });

    it('converts inline styles to standard semantic tags', () => {
      const input = '<span style="font-weight: 700">Styled Bold</span> and <span style="font-style: italic">Styled Italic</span> and <span style="text-decoration: underline">Styled Underline</span> and <span style="text-decoration: line-through">Styled Strike</span>';
      const output = sanitizeRichNoteHtml(input);
      expect(output).toContain('<b>Styled Bold</b>');
      expect(output).toContain('<i>Styled Italic</i>');
      expect(output).toContain('<u>Styled Underline</u>');
      expect(output).toContain('<s>Styled Strike</s>');
    });

    it('strips dangerous tags, scripts, and attributes', () => {
      const input = '<script>alert("xss")</script><b onclick="bad()">Safe Text</b><img src="x" onerror="bad()" />';
      const output = sanitizeRichNoteHtml(input);
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
      expect(output).not.toContain('onclick');
      expect(output).not.toContain('onerror');
      expect(output).not.toContain('<img');
      expect(output).toContain('<b>Safe Text</b>');
    });

    it('preserves line breaks and paragraphs as breaks', () => {
      const input = '<p>Line 1</p><p>Line 2<br>Line 3</p>';
      const output = sanitizeRichNoteHtml(input);
      expect(output).toMatch(/Line 1.*Line 2.*Line 3/);
      expect(output).toContain('<br');
    });
  });

  describe('extractPlainTextFromHtml', () => {
    it('extracts plain readable text without HTML tags', () => {
      const input = '<b>Quest:</b> Find the <i>ancient</i> tome.<br>Reward: 50gp';
      expect(extractPlainTextFromHtml(input)).toBe('Quest: Find the ancient tome. Reward: 50gp');
    });

    it('handles empty or plain string input directly', () => {
      expect(extractPlainTextFromHtml('')).toBe('');
      expect(extractPlainTextFromHtml('Plain text already')).toBe('Plain text already');
    });
  });

  describe('isNoteContentEmpty', () => {
    it('identifies blank, whitespace, and empty HTML container tags as empty', () => {
      expect(isNoteContentEmpty('')).toBe(true);
      expect(isNoteContentEmpty('   ')).toBe(true);
      expect(isNoteContentEmpty('<br>')).toBe(true);
      expect(isNoteContentEmpty('<div><br></div>')).toBe(true);
      expect(isNoteContentEmpty('<p><br></p>')).toBe(true);
      expect(isNoteContentEmpty('<b></b>')).toBe(true);
    });

    it('returns false when actual text exists', () => {
      expect(isNoteContentEmpty('Hello')).toBe(false);
      expect(isNoteContentEmpty('<b>Bold</b>')).toBe(false);
      expect(isNoteContentEmpty('<div>Line</div>')).toBe(false);
    });
  });
});
