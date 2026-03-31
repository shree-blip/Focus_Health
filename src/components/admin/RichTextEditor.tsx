'use client';

import { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import CharacterCount from '@tiptap/extension-character-count';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/* ─── Toolbar button helpers ─── */
const Btn = ({
  label,
  onClick,
  active = false,
  title,
  disabled = false,
  children,
}: {
  label?: string;
  onClick: () => void;
  active?: boolean;
  title?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) => (
  <button
    type="button"
    title={title ?? label}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium transition-colors border select-none ${
      active
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-background text-foreground border-input hover:bg-muted'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children ?? label}
  </button>
);

const Sep = () => <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />;

/* ─── Color picker small ─── */
const ColorPicker = ({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (color: string) => void;
  title: string;
}) => (
  <label title={title} className="relative inline-flex items-center cursor-pointer">
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
    />
    <span
      className="w-6 h-6 rounded border border-input flex-shrink-0"
      style={{ backgroundColor: value }}
    />
  </label>
);

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content...',
}: RichTextEditorProps) {
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#facc15');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: 'bg-muted rounded-lg p-4 text-sm my-4 overflow-x-auto' } },
        horizontalRule: {},
        blockquote: {},
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg border border-border max-w-full mx-auto my-4' } }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({ modestBranding: true, HTMLAttributes: { class: 'rounded-lg border border-border my-4 mx-auto max-w-full' } }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[360px] rounded-b-md border border-t-0 border-input bg-background px-4 py-3 text-sm focus-visible:outline-none prose-styles',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  /* ─── Toolbar actions ─── */
  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const src = window.prompt('Enter image URL', 'https://');
    if (!src) return;
    const alt = window.prompt('Enter alt text (for accessibility)', '') || 'Insight image';
    editor.chain().focus().setImage({ src, alt }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter YouTube video URL', 'https://www.youtube.com/watch?v=');
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const applyTextColor = useCallback(
    (color: string) => {
      setTextColor(color);
      editor?.chain().focus().setColor(color).run();
    },
    [editor]
  );

  const applyHighlight = useCallback(
    (color: string) => {
      setHighlightColor(color);
      editor?.chain().focus().setHighlight({ color }).run();
    },
    [editor]
  );

  if (!editor) return null;

  const chars = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();

  return (
    <div className="space-y-0">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-muted/50 px-2 py-1.5">
        {/* Headings */}
        <Btn label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1" />
        <Btn label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2" />
        <Btn label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3" />
        <Btn label="H4" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="Heading 4" />
        <Btn label="¶" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph" />

        <Sep />

        {/* Inline formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (⌘B)">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (⌘I)">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (⌘U)">
          <u>U</u>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <s>S</s>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          {'</>'}
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
          X<sub>2</sub>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
          X<sup>2</sup>
        </Btn>

        <Sep />

        {/* Colors */}
        <ColorPicker value={textColor} onChange={applyTextColor} title="Text color" />
        <Btn onClick={() => editor.chain().focus().unsetColor().run()} title="Remove text color">
          <span className="text-[10px]">A̲✕</span>
        </Btn>
        <ColorPicker value={highlightColor} onChange={applyHighlight} title="Highlight color" />
        <Btn onClick={() => editor.chain().focus().unsetHighlight().run()} active={editor.isActive('highlight')} title="Remove highlight">
          <span className="text-[10px]">H✕</span>
        </Btn>

        <Sep />

        {/* Alignment */}
        <Btn label="⬛◻◻" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left" />
        <Btn label="◻⬛◻" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center" />
        <Btn label="◻◻⬛" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right" />
        <Btn label="⬛⬛⬛" onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify" />

        <Sep />

        {/* Lists */}
        <Btn label="• List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list" />
        <Btn label="1. List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list" />

        <Sep />

        {/* Blocks */}
        <Btn label="❝ Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote" />
        <Btn label="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block" />
        <Btn label="— HR" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule" />

        <Sep />

        {/* Insert */}
        <Btn label="🔗 Link" onClick={setLink} active={editor.isActive('link')} title="Insert / edit link" />
        {editor.isActive('link') && (
          <Btn label="Unlink" onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link" />
        )}
        <Btn label="🖼 Image" onClick={addImage} title="Insert image from URL" />
        <Btn label="▶ YouTube" onClick={addYoutube} title="Embed YouTube video" />

        <Sep />

        {/* Table */}
        <Btn label="⊞ Table" onClick={insertTable} title="Insert 3×3 table" />
        {editor.isActive('table') && (
          <>
            <Btn label="+Col" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column after" />
            <Btn label="-Col" onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column" />
            <Btn label="+Row" onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row after" />
            <Btn label="-Row" onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row" />
            <Btn label="⊠ Del" onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table" />
          </>
        )}

        <Sep />

        {/* History */}
        <Btn label="↩ Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (⌘Z)" />
        <Btn label="↪ Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (⌘⇧Z)" />

        <Sep />

        <Btn label="Clear" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting" />
      </div>

      {/* ─── Editor content ─── */}
      <EditorContent editor={editor} />

      {/* ─── Status bar ─── */}
      <div className="flex justify-end px-3 py-1 border border-t-0 border-input rounded-b-md bg-muted/30 text-xs text-muted-foreground">
        {words} words &middot; {chars} characters
      </div>
    </div>
  );
}
