'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Write your content...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[320px] rounded-md border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:text-lg [&_h4]:font-semibold [&_a]:text-primary [&_a]:underline [&_img]:rounded-md [&_img]:max-w-full',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const src = window.prompt('Enter image URL', 'https://');
    if (!src) return;
    editor.chain().focus().setImage({ src, alt: 'Blog content image' }).run();
  };

  const toolbarButton = (label: string, onClick: () => void, active = false) => (
    <Button type="button" size="sm" variant={active ? 'default' : 'outline'} onClick={onClick}>
      {label}
    </Button>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {toolbarButton('H1', () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
        {toolbarButton('H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        {toolbarButton('H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
        {toolbarButton('H4', () => editor.chain().focus().toggleHeading({ level: 4 }).run(), editor.isActive('heading', { level: 4 }))}
        {toolbarButton('Bold', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {toolbarButton('Italic', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {toolbarButton('Underline', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
        {toolbarButton('Bullet', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {toolbarButton('Ordered', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {toolbarButton('Link', setLink, editor.isActive('link'))}
        {toolbarButton('Image', addImage)}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
