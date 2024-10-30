"use client";

import * as React from "react";
import { MessageSquare, Send, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useRef, useState } from "react";
import { Message, useAssistant } from "ai/react";
import ReactMarkdown from "react-markdown";

const ChatbotRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("fixed bottom-4 right-4 z-50", className)}
    {...props}
  />
));
ChatbotRoot.displayName = "ChatbotRoot";

interface ChatbotTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  attentionText?: string;
}

const ChatbotTrigger = React.forwardRef<HTMLButtonElement, ChatbotTriggerProps>(
  ({ className, attentionText, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(
        attentionText
          ? "w-96 justify-start space-x-2 px-4 py-6" // Added py-6 for more vertical padding
          : "rounded-full w-12 h-12", // Original circular style
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "transition-all duration-200 ease-out",
        "animate-in fade-in slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <MessageSquare className="w-6 h-6" />
      {attentionText && (
        <span className="flex-1 text-left ml-2">{attentionText}</span>
      )}
    </Button>
  )
);
ChatbotTrigger.displayName = "ChatbotTrigger";

const ChatbotWindow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-96 h-[32rem] bg-background border border-border rounded-lg shadow-lg flex flex-col",
      "transition-all duration-200 ease-out",
      "origin-bottom-right",
      "animate-in fade-in slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
ChatbotWindow.displayName = "ChatbotWindow";

const ChatbotHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex justify-between items-center p-4 border-b border-border cursor-pointer",
      className
    )}
    onClick={onClose}
    {...props}
  />
));
ChatbotHeader.displayName = "ChatbotHeader";

const ChatbotHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
ChatbotHeaderTitle.displayName = "ChatbotHeaderTitle";

const ChatbotHeaderAvatar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Avatar>
>((props, ref) => <Avatar ref={ref} {...props} />);
ChatbotHeaderAvatar.displayName = "ChatbotHeaderAvatar";

const ChatbotCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>((props, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="icon"
    className="text-foreground"
    {...props}
  >
    <X className="w-4 h-4" />
  </Button>
));
ChatbotCloseButton.displayName = "ChatbotCloseButton";

const ChatbotNotificationButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    notificationPermission: NotificationPermission;
  }
>(({ notificationPermission, className, onClick, ...props }, ref) => (
  <Button
    ref={ref}
    variant={notificationPermission === "granted" ? "secondary" : "ghost"}
    size="icon"
    className={cn(
      "text-foreground",
      notificationPermission === "granted" ? "bg-secondary" : "",
      className
    )}
    title={
      notificationPermission === "granted"
        ? "Disable notifications"
        : "Enable notifications"
    }
    onClick={onClick}
    {...props}
  >
    <Bell className="w-4 h-4" />
  </Button>
));
ChatbotNotificationButton.displayName = "ChatbotNotificationButton";

const ChatbotMessageList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ScrollArea>
>((props, ref) => (
  <ScrollArea ref={ref} className="flex-grow p-4" {...props} />
));
ChatbotMessageList.displayName = "ChatbotMessageList";

const ChatbotMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { role: "user" | "assistant" }
>(({ role, className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mb-4",
      role === "user" ? "text-right" : "text-left",
      className
    )}
    {...props}
  >
    <div
      className={cn(
        "inline-block p-2 rounded-lg",
        role === "user"
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      )}
    >
      {role === "assistant" ? (
        <ReactMarkdown
          components={{
            // Text elements
            p: ({ children }) => (
              <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
            ),
            h1: ({ children }) => (
              <h1 className="text-xl font-bold mb-4 mt-6">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-bold mb-3 mt-5">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-md font-bold mb-2 mt-4">{children}</h3>
            ),

            // Lists
            ul: ({ children }) => (
              <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>
            ),
            li: ({ children }) => <li className="mb-1">{children}</li>,

            // Code elements
            code: ({ className, children }) => {
              return <code className={className}>{children}</code>;
            },
            pre: ({ children }) => (
              <pre className="bg-muted p-3 rounded-md text-sm my-3 overflow-x-auto font-mono">
                {children}
              </pre>
            ),

            // Inline elements
            strong: ({ children }) => (
              <strong className="font-bold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline underline-offset-2 decoration-1"
              >
                {children}
              </a>
            ),

            // Block elements
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-muted pl-4 italic my-2">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="my-4 border-muted" />,

            // Tables
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-muted">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted/50">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-muted">{children}</tbody>
            ),
            tr: ({ children }) => <tr>{children}</tr>,
            td: ({ children }) => <td className="px-3 py-2">{children}</td>,
            th: ({ children }) => (
              <th className="px-3 py-2 font-semibold text-left">{children}</th>
            ),
          }}
        >
          {children as string}
        </ReactMarkdown>
      ) : (
        children
      )}
    </div>
  </div>
));
ChatbotMessage.displayName = "ChatbotMessage";

const ChatbotInputForm = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
  <form
    ref={ref}
    className={cn("p-4 border-t border-border", className)}
    {...props}
  />
));
ChatbotInputForm.displayName = "ChatbotInputForm";

const ChatbotInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn("flex-grow", className)}
    placeholder="Type your message..."
    {...props}
  />
));
ChatbotInput.displayName = "ChatbotInput";

const ChatbotSubmitButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>((props, ref) => (
  <Button ref={ref} type="submit" className="px-3" size="icon" {...props}>
    <Send className="w-4 h-4 mr-[2px]" />
  </Button>
));
ChatbotSubmitButton.displayName = "ChatbotSubmitButton";

const ChatbotThinkingIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center space-x-2 text-muted-foreground",
      className
    )}
    {...props}
  >
    <div
      className="w-2 h-2 bg-current rounded-full animate-bounce"
      style={{ animationDelay: "0ms" }}
    ></div>
    <div
      className="w-2 h-2 bg-current rounded-full animate-bounce"
      style={{ animationDelay: "150ms" }}
    ></div>
    <div
      className="w-2 h-2 bg-current rounded-full animate-bounce"
      style={{ animationDelay: "300ms" }}
    ></div>
  </div>
));
ChatbotThinkingIndicator.displayName = "ChatbotThinkingIndicator";

export const createNotificationSound = () => {
  const context = new AudioContext();

  // Create reverb effect
  const convolver = context.createConvolver();
  const reverbTime = 2;
  const sampleRate = context.sampleRate;
  const impulseLength = sampleRate * reverbTime;
  const impulse = context.createBuffer(2, impulseLength, sampleRate);

  // Generate impulse response for reverb
  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);
    for (let i = 0; i < impulseLength; i++) {
      impulseData[i] =
        (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.1));
    }
  }
  convolver.buffer = impulse;

  // Helper function to create and play a tone with ADSR envelope
  const playTone = (frequency: number, startTime: number) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    // ADSR envelope parameters
    const attack = 0.02;
    const decay = 0.05;
    const sustain = 0.5;
    const release = 0.1;

    oscillator.connect(gainNode);
    gainNode.connect(convolver);
    convolver.connect(context.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Apply ADSR envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + attack);
    gainNode.gain.linearRampToValueAtTime(
      0.2 * sustain,
      startTime + attack + decay
    );
    gainNode.gain.setValueAtTime(0.2 * sustain, startTime + 0.15);
    gainNode.gain.linearRampToValueAtTime(0, startTime + 0.15 + release);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.15 + release);
  };

  // Play two pleasant tones in sequence
  playTone(698.46, context.currentTime); // F5 note
  playTone(1046.5, context.currentTime + 0.2); // C6 note (perfect 5th above F5)
};

export interface ChatbotProps {
  initialMessage?: string;
  avatarSrc?: string;
  title?: string;
  attentionText?: string;
}

export function Chatbot({
  initialMessage = "Hi there! How can I help you today?",
  avatarSrc = "",
  title = "Chatbot",
  attentionText,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>("default");

  // Replace useChat with useAssistant
  const {
    status,
    messages,
    input,
    submitMessage,
    handleInputChange,
    setMessages,
  } = useAssistant({
    api: "/api/assistant",
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMessages([
      {
        id: "initial-message",
        content: initialMessage,
        role: "assistant",
      },
    ]);
  }, [initialMessage, setMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Find the viewport element within the ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 100);
      }
    }
  }, [messages, status]);

  const toggleChatbot = () => setIsOpen(!isOpen);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitMessage(e);
  };

  const toggleNotifications = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        // We can't actually revoke permission programmatically, but we can disable notifications
        // by setting the permission state to 'default'
        setNotificationPermission("default");
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  };

  // Add a ref to track the previous message count
  const previousAiMessageCount = useRef(0);

  // Replace the status effect with a messages effect
  React.useEffect(() => {
    const aiMessages = messages.filter((m) => m.role === "assistant").length;

    // Only trigger notification if we have a new AI message and it's not the initial message
    if (
      aiMessages > previousAiMessageCount.current && 
      messages[messages.length - 1]?.id !== "initial-message"
    ) {
      createNotificationSound();
      if ("Notification" in window && notificationPermission === "granted") {
        new Notification(`New message from ${title}`, {
          body: "You have a new reply!",
        });
      }
    }

    previousAiMessageCount.current = aiMessages;
  }, [messages, title, notificationPermission]);

  return (
    <ChatbotRoot>
      {!isOpen && (
        <ChatbotTrigger onClick={toggleChatbot} attentionText={attentionText} />
      )}
      {isOpen && (
        <ChatbotWindow>
          <ChatbotHeader onClose={toggleChatbot}>
            <div
              className="flex items-center space-x-3"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatbotHeaderAvatar>
                <AvatarImage src={avatarSrc} alt="Chatbot Avatar" />
                <AvatarFallback>{title.charAt(0).toUpperCase()}</AvatarFallback>
              </ChatbotHeaderAvatar>
              <ChatbotHeaderTitle>{title}</ChatbotHeaderTitle>
            </div>
            <div
              className="flex items-center space-x-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatbotNotificationButton
                notificationPermission={notificationPermission}
                onClick={toggleNotifications}
              />
              <ChatbotCloseButton onClick={toggleChatbot} />
            </div>
          </ChatbotHeader>
          <ChatbotMessageList ref={scrollAreaRef}>
            {messages.map((message: Message) => (
              <ChatbotMessage
                key={message.id}
                role={
                  message.role === "data"
                    ? "assistant"
                    : (message.role as "user" | "assistant")
                }
              >
                {message.role !== "data" ? (
                  message.content
                ) : (
                  <>
                    {(message.data as any).description}
                    <pre className="bg-muted p-2 rounded-sm text-sm">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  </>
                )}
              </ChatbotMessage>
            ))}
            {status === "in_progress" && <ChatbotThinkingIndicator />}
          </ChatbotMessageList>
          <ChatbotInputForm onSubmit={handleFormSubmit}>
            <div className="flex space-x-2">
              <ChatbotInput
                value={input}
                onChange={handleInputChange}
                disabled={status !== "awaiting_message"}
              />
              <ChatbotSubmitButton disabled={status !== "awaiting_message"} />
            </div>
          </ChatbotInputForm>
        </ChatbotWindow>
      )}
    </ChatbotRoot>
  );
}

Chatbot.displayName = "Chatbot";

export {
  ChatbotRoot,
  ChatbotTrigger,
  ChatbotWindow,
  ChatbotHeader,
  ChatbotHeaderTitle,
  ChatbotHeaderAvatar,
  ChatbotCloseButton,
  ChatbotNotificationButton,
  ChatbotMessageList,
  ChatbotMessage,
  ChatbotInputForm,
  ChatbotInput,
  ChatbotSubmitButton,
  ChatbotThinkingIndicator,
};
