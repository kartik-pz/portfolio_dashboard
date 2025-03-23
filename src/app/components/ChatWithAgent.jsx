'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatWithAgent.css';

function ChatWithAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    console.log('User message sent:', input);
    
    // Clear input field
    setInput('');
    
    // Show loading indicator
    setIsLoading(true);
    
    try {
      // Call our local API endpoint instead of Dify directly
      console.log('Sending request to server API');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversation_id: conversationId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received response from server:', data);
      
      // Save conversation ID if available
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }
      
      // Add AI response to chat
      const aiMessage = { text: data.answer, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
    } catch (error) {
      console.error('Error calling server API:', error);
      
      // Add error message
      const errorMessage = { 
        text: 'Sorry, there was an error processing your request.', 
        sender: 'ai', 
        isError: true 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom renderer for markdown code blocks
  const MarkdownRenderer = ({ children }) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {children}
      </ReactMarkdown>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat with AI Assistant</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
          >
            {message.sender === 'ai' ? (
              <MarkdownRenderer>
                {message.text}
              </MarkdownRenderer>
            ) : (
              message.text
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai loading">
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWithAgent; 