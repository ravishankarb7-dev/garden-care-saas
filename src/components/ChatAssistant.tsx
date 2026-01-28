'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/Card";
import { MessageCircle, X, Send, Sprout, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatAssistantProps {
    zip?: string;
    plants?: any[];
}

export default function ChatAssistant({ zip, plants }: ChatAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Persistence: Load from Local Storage on Mount (Hybrid Model)
    useEffect(() => {
        const savedMessages = localStorage.getItem('sage_messages_v3'); // v3 forces new privacy warning
        const savedState = localStorage.getItem('sage_isOpen');

        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        } else {
            // Initial Greeting if no history
            setMessages([{
                role: 'assistant',
                content: "Hi! I'm Sage, your AI groundskeeper. 🌿\n\nI can help with watering, pests, and pruning. Just a heads up: I'm an AI, so please **don't share personal info** (like your address or real name) in this chat."
            }]);
        }

        if (savedState) {
            setIsOpen(savedState === 'true');
        }

        // Listen for Feedback Event (Petals & Prickles)
        const handleFeedbackRequest = () => {
            setIsOpen(true);
            setMessages(prev => {
                const PROMPT = "I'm all ears! Tell me about the Petals (what you love) or the Prickles (what needs fixing).";
                // Avoid duplicate prompts
                if (prev.length > 0 && prev[prev.length - 1].content === PROMPT) return prev;

                return [...prev, {
                    role: 'assistant',
                    content: PROMPT
                }];
            });
        };

        window.addEventListener('open-sage-feedback', handleFeedbackRequest);
        return () => window.removeEventListener('open-sage-feedback', handleFeedbackRequest);
    }, []);

    // Persistence: Save on Change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('sage_messages_v3', JSON.stringify(messages));
        }
        localStorage.setItem('sage_isOpen', String(isOpen));
    }, [messages, isOpen]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !selectedImage) return;

        // Construct message content
        let contentPayload: any = inputValue;
        if (selectedImage) {
            contentPayload = [
                { type: "text", text: inputValue || "Analyze this image." },
                { type: "image_url", image_url: { url: selectedImage } }
            ];
        }

        // Optimistic Update (Display Safe)
        const displayContent = selectedImage
            ? `![User Image](${selectedImage})\n\n${inputValue}`
            : inputValue;

        const newMsg: Message = { role: 'user', content: displayContent as any };
        const updatedMessages = [...messages, newMsg];

        setMessages(updatedMessages);
        setInputValue("");
        setSelectedImage(null);
        setLoading(true);

        try {
            // Prepare context
            // Backend expects 'content' to be either string or array.
            // We pass the RAW payload for the API, but store the CLEAN one for display?
            // Actually, let's store the raw payload in state if we can render it, 
            // but for now, the existing renderer uses ReactMarkdown which expects string.
            // So we hacked 'displayContent' above.

            // For API, we need to reconstruct the structured object for the *last* message
            const apiMessages = updatedMessages.map(m => {
                // If it looks like a markdown image we just made, reconstruct it?
                // Or better: Let's accept that we are sending the 'contentPayload' to the API
                // but we stored 'displayContent' in local state.
                // This is a bit messy. 
                // Let's pass the payload specifically for the last message.

                // Hack: If it's the LAST message and we just sent it, use contentPayload.
                // But we lost contentPayload reference.
                // Let's change 'messages' state to allow 'any' content?
                return {
                    role: m.role,
                    content: m.content
                };
            });

            // Patch the last message for the API call to be the STRUCTURED one if needed
            if (selectedImage) {
                apiMessages[apiMessages.length - 1].content = contentPayload;
            }

            // Fetch logs just-in-time
            let recentLogs = [];
            let devId = "unknown";
            try {
                const { getAllCareLogs } = await import("@/lib/queries");
                const { getOrCreateDeviceId } = await import("@/lib/device");
                devId = getOrCreateDeviceId();
                recentLogs = await getAllCareLogs(devId);
            } catch (e) {
                console.warn("Failed to fetch logs for chat context", e);
            }

            const res = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    context: {
                        zip,
                        plants: plants?.map(p => ({
                            name: p.name,
                            id: p.id,
                            plantedAt: p.plantedAt
                        })),
                        logs: recentLogs
                    }
                })
            });

            if (!res.ok) throw new Error("Connection failed");

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

            // Hybrid Beacon: Send Transcript for Insight Extraction (Silent Observer)
            // Fire and forget - don't await
            fetch('/api/agent/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...apiMessages, { role: 'assistant', content: data.message }],
                    deviceId: devId
                })
            }).catch(err => console.error("Optimization Beacon failed", err));

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the shed. Please check your internet connection." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button - High Contrast Fix */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 bg-emerald-700 text-white rounded-full shadow-2xl border-2 border-white hover:bg-emerald-800 transition-all z-50 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
                style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
            >
                <Sprout size={24} />
                <span className="font-serif font-bold hidden md:inline tracking-wide">Ask Sage</span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <Card className="flex-1 flex flex-col overflow-hidden border-2 border-primary/20 shadow-2xl">
                        {/* Header */}
                        <div className="bg-primary/5 p-4 flex items-center justify-between border-b border-primary/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Sprout size={18} />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-zinc-900">Sage</h3>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Groundskeeper</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white" ref={scrollRef}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-br-none font-medium'
                                        : 'bg-zinc-100 text-zinc-800 rounded-bl-none prose prose-p:my-1 prose-a:text-blue-600 prose-sm'
                                        }`}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-bl-none px-4 py-3 text-zinc-400 text-xs italic flex items-center gap-2">
                                        <span className="animate-pulse">●</span>
                                        <span className="animate-pulse delay-100">●</span>
                                        <span className="animate-pulse delay-200">●</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-zinc-50 border-t border-zinc-100">
                            {/* Image Preview */}
                            {selectedImage && (
                                <div className="mb-2 relative inline-block">
                                    <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-zinc-200" />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute -top-1 -right-1 bg-zinc-900 text-white rounded-full p-0.5 shadow-md hover:bg-red-500"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask before acting. When in doubt, wait."
                                    className="bg-white border-zinc-200 focus-visible:ring-primary"
                                />

                                {/* Image Upload Button */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                />
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant={selectedImage ? "default" : "outline"}
                                    className={`px-3 ${selectedImage ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'text-zinc-400'}`}
                                    title="Upload Photo"
                                >
                                    <ImageIcon size={18} />
                                </Button>

                                <Button
                                    onClick={handleSendMessage}
                                    disabled={(!inputValue.trim() && !selectedImage) || loading}
                                    className="bg-primary hover:bg-primary/90 text-white w-12 px-0"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                            <div className="text-[10px] text-center text-zinc-400 mt-2">
                                Sage is an AI. Your chat stays on this device. We analyze topics to improve the app.
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
