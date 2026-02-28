'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useCallback, useState, useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  List, ListOrdered, Heading2, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Image as ImageIcon, ChevronDown, Type,
} from 'lucide-react';

const TOKENS = [
  { label: 'First Name', value: '{{first_name}}' },
  { label: 'Last Name', value: '{{last_name}}' },
  { label: 'Full Name', value: '{{full_name}}' },
  { label: 'Company', value: '{{company}}' },
  { label: 'Email', value: '{{email}}' },
];

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ initialContent = '', onChange, placeholder = 'Start writing your email...', minHeight = '280px' }: RichTextEditorProps) {
  const [showTokenMenu, setShowTokenMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-2' },
      }),
      TextStyle,
      Color,
      Underline,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 text-slate-800 leading-relaxed',
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync initialContent changes (e.g. when editing a different template)
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentContent = editor.getHTML();
      // Only update if the content is meaningfully different
      if (currentContent !== initialContent && !(currentContent === '<p></p>' && initialContent === '')) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [initialContent, editor]);

  const insertToken = useCallback((token: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(token).run();
    setShowTokenMenu(false);
  }, [editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    if (showLinkInput) {
      if (linkUrl) {
        const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
        editor.chain().focus().setLink({ href: url }).run();
      }
      setShowLinkInput(false);
      setLinkUrl('');
    } else if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      setShowLinkInput(true);
    }
  }, [editor, showLinkInput, linkUrl]);

  const handleImageUpload = useCallback(() => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words?.() ??
    editor.getText().split(/\s+/).filter(Boolean).length;
  const charCount = editor.getText().length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 border-b border-slate-200 bg-slate-50 flex-wrap">
        {/* Text formatting */}
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Heading */}
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        {/* Lists */}
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Link */}
        <ToolbarButton
          active={editor.isActive('link')}
          onClick={handleLink}
          title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton
          active={false}
          onClick={handleImageUpload}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Text Color */}
        <div className="relative">
          <input
            type="color"
            className="w-7 h-7 rounded cursor-pointer border border-slate-200"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            title="Text Color"
            defaultValue="#0f172a"
          />
        </div>

        <div className="flex-1" />

        {/* Personalization tokens */}
        <div className="relative">
          <button
            onClick={() => setShowTokenMenu(!showTokenMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Type className="w-3 h-3" />
            Personalize
            <ChevronDown className="w-3 h-3" />
          </button>
          {showTokenMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
              {TOKENS.map(t => (
                <button
                  key={t.value}
                  onClick={() => insertToken(t.value)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="text-slate-700">{t.label}</span>
                  <code className="text-[10px] text-slate-400">{t.value}</code>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Link URL input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 border-b border-blue-100">
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleLink(); if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl(''); } }}
          />
          <button onClick={handleLink} className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Apply
          </button>
          <button onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400">
        <span>{wordCount} words &middot; {charCount} characters</span>
        <span>Rich text &middot; HTML</span>
      </div>
    </div>
  );
}

function ToolbarButton({ active, onClick, children, title, disabled = false }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : disabled
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}
