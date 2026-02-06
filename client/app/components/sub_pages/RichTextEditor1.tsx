'use client';

import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
    onContentChange: (content: string) => void;
    initialContent?: string;
}

export default function RichTextEditor({ onContentChange, initialContent = '' }: RichTextEditorProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const quillRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initializeEditor = async () => {
            try {
                // Dynamically import Quill
                const Quill = await import('quill');
                const QuillDefault = Quill.default;

                // Initialize editor
                if (containerRef.current && !quillRef.current) {
                    // Clear container
                    containerRef.current.innerHTML = '';

                    // Create editor container
                    const editorContainer = document.createElement('div');
                    editorContainer.id = 'quill-editor-' + Date.now();
                    containerRef.current.appendChild(editorContainer);

                    // Try to enable table module
                    let tableModule = false;
                    try {
                        // Try to import table module
                        await import('quill/modules/table');
                        tableModule = true;
                    } catch (err) {
                        // console.log('Table module not available, continuing without it');
                    }

                    // Initialize Quill with table support if available
                    const modules: any = {
                        toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'align': [] }],
                            ['link', 'image'],
                            ['clean']
                        ]
                    };

                    // Add table button if module is available
                    if (tableModule) {
                        modules.toolbar.splice(modules.toolbar.length - 1, 0, ['table']);
                    }

                    quillRef.current = new QuillDefault(`#${editorContainer.id}`, {
                        theme: 'snow',
                        modules,
                        placeholder: 'Start writing your blog post here...',
                    });

                    // Set initial content
                    if (initialContent) {
                        quillRef.current.root.innerHTML = initialContent;
                    }

                    // Handle content changes
                    quillRef.current.on('text-change', () => {
                        const content = quillRef.current.root.innerHTML;
                        onContentChange(content);
                    });

                    setIsLoaded(true);
                }
            } catch (error) {
                console.error('Error initializing editor:', error);
                setIsLoaded(true); // Still mark as loaded to show container
            }
        };

        initializeEditor();

        return () => {
            if (quillRef.current) {
                try {
                    quillRef.current.off('text-change');
                } catch (e) {
                    // console.log('Error cleaning up editor:', e);
                }
                quillRef.current = null;
            }
        };
    }, []);

    // Update content when initialContent prop changes
    useEffect(() => {
        if (quillRef.current && initialContent !== quillRef.current.root.innerHTML) {
            quillRef.current.root.innerHTML = initialContent;
        }
    }, [initialContent]);

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
            {!isLoaded && (
                <div className="h-64 flex items-center justify-center">
                    <div className="text-gray-500">Loading editor...</div>
                </div>
            )}
            <div
                ref={containerRef}
                className={`${isLoaded ? 'min-h-[300px]' : 'h-0'}`}
            />

            <style jsx global>{`
                .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #e5e7eb;
                    background: #f9fafb;
                    padding: 12px;
                }
                .ql-container.ql-snow {
                    border: none;
                    font-size: 16px;
                    min-height: 300px;
                }
                .ql-editor {
                    min-height: 300px;
                    padding: 24px;
                }
                .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                    left: 24px;
                }
                .ql-toolbar button:hover {
                    color: #3b82f6;
                }
                .ql-toolbar button.ql-active {
                    color: #3b82f6;
                }
                .ql-snow .ql-picker-label:hover {
                    color: #3b82f6;
                }
                .ql-snow .ql-stroke {
                    stroke: #4b5563;
                }
                .ql-snow .ql-fill {
                    fill: #4b5563;
                }
                .ql-snow .ql-picker-label {
                    color: #4b5563;
                }
                table {
                    border-collapse: collapse;
                }
                table td, table th {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                table tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
            `}</style>
        </div>
    );
}