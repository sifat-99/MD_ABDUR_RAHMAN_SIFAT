"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Bot, Briefcase, Code, Terminal, UserCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useSidebar } from "../ui/sidebar";
import type { CHAT_PROFILE_QUERYResult } from "@/sanity.types";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";

interface Message {
    id: string;
    role: "user" | "model";
    content: string;
}

export function Chat({
    profile,
}: {
    profile: CHAT_PROFILE_QUERYResult | null;
}) {
    const { toggleSidebar } = useSidebar();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const suggestedPrompts = [
        {
            icon: Briefcase,
            label: "What's your experience?",
            prompt: "Tell me about your professional experience and previous roles",
        },
        {
            icon: Code,
            label: "What skills do you have?",
            prompt: "What technologies and programming languages do you specialize in?",
        },
        {
            icon: Terminal,
            label: "What have you built?",
            prompt: "Show me some of your most interesting projects",
        },
        {
            icon: UserCircle,
            label: "Who are you?",
            prompt: "Tell me more about yourself and your background",
        },
    ];

    // Filter suggestions based on input
    const visibleSuggestions = input.trim()
        ? suggestedPrompts.filter(p =>
            p.label.toLowerCase().includes(input.toLowerCase()) ||
            p.prompt.toLowerCase().includes(input.toLowerCase())
        ).slice(0, 2)
        : [];

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content,
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error("Network response was not ok");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "model",
                content: "",
            };

            setMessages(prev => [...prev, botMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").filter(line => line.trim() !== "");

                for (const line of lines) {
                    if (line.startsWith('0:')) {
                        try {
                            // Format is 0:"string"
                            // We slice off "0:" and parse the JSON string
                            const contentChunk = JSON.parse(line.slice(2));
                            botMsg.content += contentChunk;

                            setMessages(prev => {
                                const newMessages = [...prev];
                                const lastMsg = newMessages[newMessages.length - 1];
                                if (lastMsg.role === "model") {
                                    lastMsg.content = botMsg.content;
                                }
                                return newMessages;
                            });
                        } catch (e) {
                            console.error("Error parsing chunk:", line, e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            // Optionally add error message to chat
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const fullName = [profile?.firstName, profile?.lastName]
        .filter(Boolean)
        .join(" ");

    const greeting = profile?.firstName
        ? `Hi! I'm ${fullName}. Ask me anything about my work, experience, or projects.`
        : "Hi there! Ask me anything about my work, experience, or projects.";

    return (
        <div className="flex flex-col h-full bg-background border-l border-border w-full max-w-md mx-auto shadow-xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        {profile?.profileImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={urlFor(profile.profileImage).width(64).height(64).url()}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-1 ring-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">
                            Chat with {profile?.firstName || "Me"}
                        </h3>
                        <p className="text-xs text-muted-foreground">Digital Twin</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="space-y-6 mt-4">
                        <div className="bg-primary/5 p-4 rounded-lg">
                            <p className="text-sm">{greeting}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
                                Suggested questions
                            </p>
                            {suggestedPrompts.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => sendMessage(item.prompt)}
                                    className="flex items-center gap-3 p-3 text-left text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors bg-card"
                                >
                                    <item.icon className="w-4 h-4 text-muted-foreground" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "flex w-full mb-4",
                            m.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "flex flex-col max-w-[85%] rounded-2xl px-4 py-3 text-sm break-words",
                                m.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-muted text-foreground rounded-bl-none"
                            )}
                        >
                            <ReactMarkdown
                                components={{
                                    // Override default element styling to match chat bubble look
                                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li>{children}</li>,
                                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
                                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                    blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/50 pl-3 italic my-2">{children}</blockquote>,
                                    code: ({ children }) => <code className="bg-muted-foreground/20 rounded px-1 py-0.5 font-mono text-xs">{children}</code>
                                }}
                            >
                                {m.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-2 text-[10px] text-center text-muted-foreground bg-background/50 backdrop-blur-sm border-t border-border/50">
                AI-generated content. Verify important details.
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card relative">
                {/* Suggestions Popup */}
                {visibleSuggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
                        <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">
                            Suggestions
                        </p>
                        <div className="flex flex-col gap-2">
                            {visibleSuggestions.map((item, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => sendMessage(item.prompt)}
                                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors text-left"
                                >
                                    <item.icon className="w-3 h-3" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div >
    );
}

export default Chat;
