import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

interface QuillInstance {
    getModule: (name: string) => any;
    updateContents: (delta: any, source?: string) => void;
    getContents: () => any;
    setContents: (contents: any) => void;
    on: (event: string, handler: Function) => void;
    off: (event: string, handler?: Function) => void;
}

// Flag to prevent multiple registrations
let quillRegistered = false;

export default function QuillTableEditor() {
    const [isLoaded, setIsLoaded] = useState(false);
    const quillRef = useRef<QuillInstance | null>(null);
    const tableModuleRef = useRef<any>(null);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const loadAndInitialize = async () => {
            try {
                // Dynamically import Quill
                const Quill = (await import('quill')).default;

                // Only register table module once
                if (!quillRegistered) {
                    // Dynamically import table module
                    const TableModule = await import('quill/modules/table');
                    const Table = TableModule.default;

                    // Check if already registered before registering
                    try {
                        Quill.register('modules/table', Table, true);
                        // console.log('Table module registered successfully');
                    } catch (err) {
                        // console.log('Table module already registered or error:', err);
                    }

                    quillRegistered = true;
                }

                // Initialize editor
                initializeEditor(Quill);
                setIsLoaded(true);
            } catch (error) {
                console.error('Error loading Quill:', error);
            }
        };

        const initializeEditor = (Quill: any) => {
            // Check if container exists
            const editorContainer = document.getElementById('editor-container');

            if (!editorContainer) {
                console.error('Editor container not found');
                return;
            }

            // Clear existing editor if any
            editorContainer.innerHTML = '';

            // Initialize Snow theme editor with table support
            quillRef.current = new Quill(editorContainer, {
                theme: 'snow',
                modules: {
                    table: true,
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['table'],
                        ['clean']
                    ]
                },
                placeholder: 'Start typing here...',
            });

            // Get table module
            if (quillRef.current) {
                tableModuleRef.current = quillRef.current.getModule('table');
            }
        };

        loadAndInitialize();

        // Cleanup on unmount
        return () => {
            if (quillRef.current) {
                quillRef.current = null;
                tableModuleRef.current = null;
            }
        };
    }, []);


    return (
        <div className="p-6">
            {!isLoaded && (
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading editor...</p>
                </div>
            )}

            <div className="flex flex-col space-y-6">
                {/* Editor Panel */}
                <div className="flex-1">
                    <div className="mb-2">
                        <h3 className="text-lg font-semibold text-gray-700">Rich Text Editor</h3>
                        <p className="text-sm text-gray-500">Full-featured editor with table support</p>
                    </div>
                    <div id="editor-container" className="h-96 mb-4 border border-gray-300 rounded-lg"></div>

                </div>
            </div>
        </div>
    );
}