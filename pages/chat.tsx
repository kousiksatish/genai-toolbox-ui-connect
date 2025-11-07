
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Chat.module.css';
import WidgetCard from '../components/WidgetCard';
import Table from '../components/Table';

const componentMap: { [key: string]: React.ComponentType<any> } = {
  'execute_sql': Table,
  'list_invalid_indexes': Table,
  'list_top_bloated_tables': Table,
  'list_autovacuum_configurations': Table,
  'list_replication_slots': Table,
  'list_memory_configurations': Table,
};

const FormattedText = ({ text }: { text: string }) => {
  const formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/^\* /gm, '• ');
  return <div dangerouslySetInnerHTML={{ __html: formattedText.replace(/\n/g, '<br />') }} />;
};

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ user: string; text: string }[]>([]);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [widgets, setWidgets] = useState<{ id: number; componentKey: string; data?: any; isLoading: boolean; toolCallId?: string }[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const toolCallIdCounter = useRef(0);

  const initialMessage = {
    user: 'Agent',
    text: "Welcome! I'm your helpful Postgres DB assistant. How can I help you with your database?",
  };

  const APP_NAME = "genui-app";
  const SESSION_ID = "ffdbe978-5a02-4fed-a0f0-054ec13a6555";
  const USER_ID = "user";

  useEffect(() => {
    setChatHistory([initialMessage]);
    const createSession = async () => {
      try {
        await fetch(`http://127.0.0.1:8000/apps/${APP_NAME}/users/${USER_ID}/sessions/${SESSION_ID}`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };

    createSession();

  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory, streamingResponse]);

  const processParts = (part: any, isPartial: boolean): string | undefined => {
    if (part.text) {
      return isPartial ? part.text : undefined;
    } else if (part.functionCall) {
      const newToolCallId = `${part.functionCall.name}-${toolCallIdCounter.current++}`;
      addWidget(part.functionCall.name, undefined, true, newToolCallId);
      return undefined; // `\n\`\`\Tool ${part.functionCall.name} executing with arguments: ${JSON.stringify(part.functionCall.args)}.\n\`\`\`\n`;
    } else if (part.functionResponse) {
      setWidgets(prevWidgets => {
        const widgetIndex = prevWidgets.findIndex(w => w.componentKey === part.functionResponse.name && w.isLoading);
        if (widgetIndex > -1) {
          const updatedWidgets = [...prevWidgets];
          try {
            const responseData = part.functionResponse.response;
            updatedWidgets[widgetIndex] = { ...updatedWidgets[widgetIndex], data: JSON.parse(responseData.result), isLoading: false };
          } catch (e) {
            console.error('Failed to parse tool response', e);
            updatedWidgets[widgetIndex] = { ...updatedWidgets[widgetIndex], data: { error: 'Failed to parse response' }, isLoading: false };
          }
          return updatedWidgets;
        }
        return prevWidgets;
      });
      return undefined; // `\n\`\`\Tool response: ${JSON.stringify(part.functionResponse.response)}.\n\`\`\`\n`;
    }
    return '';
  }

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    setChatHistory(prev => [...prev, { user: 'You', text: message }]);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/run_sse', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          appName: APP_NAME,
          userId: USER_ID,
          sessionId: SESSION_ID,
          newMessage: {
            parts: [{ text: message }],
            role: "user",
          },
          streaming: true,
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let agentResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const json = JSON.parse(line.substring(5));
              if (json.content) {
                agentResponse += json.content.parts.map((part: any) => processParts(part, json.partial)).join(' ');
                setStreamingResponse(agentResponse);
              }
            } catch (e) {
              console.error('Failed to parse SSE chunk', e);
            }
          }
        }
      }

      if (agentResponse) {
        setChatHistory(prev => [...prev, { user: 'Agent', text: agentResponse }]);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setStreamingResponse('');
    }
  };

  const handleReset = () => {
    setChatHistory([initialMessage]);
  };

  const addWidget = (componentKey: string, data?: any, isLoading = false, toolCallId?: string) => {
    const newWidget = {
      id: Date.now(),
      componentKey,
      data,
      isLoading,
      toolCallId,
    };
    setWidgets(prevWidgets => [...prevWidgets, newWidget]);
  };

  const removeWidget = (id: number) => {
    setWidgets(prevWidgets => prevWidgets.filter(widget => widget.id !== id));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h1 className={styles.chatTitle}>Postgres Database assistant</h1>
          <button className={styles.resetButton} onClick={handleReset}>
            Reset Chat
          </button>
        </div>
        <div className={styles.chatHistory} ref={chatHistoryRef}>
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                chat.user === 'You' ? styles.userMessage : styles.agentMessage
              }`}
            >
              <FormattedText text={chat.text} />
            </div>
          ))}
          {streamingResponse && (
            <div className={`${styles.message} ${styles.agentMessage}`}>
              <FormattedText text={streamingResponse} />
            </div>
          )}
        </div>
        <div className={styles.inputArea}>
          <input
            type="text"
            className={styles.inputField}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about your postgres DB..."
          />
          <button className={styles.sendButton} onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
      <div className={styles.panelContainer}>
        {widgets.map(widget => {
          const Component = componentMap[widget.componentKey];
          return (
            <WidgetCard key={widget.id} onClose={() => removeWidget(widget.id)} isLoading={widget.isLoading}>
              {Component ? <Component data={widget.data} /> : <p>Unknown component</p>}
            </WidgetCard>
          );
        })}
      </div>
    </div>
  );
};

export default ChatPage;
