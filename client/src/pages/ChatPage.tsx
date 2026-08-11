import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Avatar, Badge, Button, Empty, Input, Layout, Tooltip, Typography } from 'antd';
import { LogoutOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

import { useChatSocket } from '../hooks/useChatSocket';
import { clearSession, getUser } from '../services/authApi';
import { MAX_MESSAGE_LENGTH, type ChatMessage } from '../services/chatApi';
import { ROUTES } from '../routes';

const { Header, Content, Footer } = Layout;
const { Text, Title } = Typography;

const STATUS_LABEL = {
  connecting: { color: 'gold', text: 'Свързване…' },
  online: { color: 'green', text: 'На линия' },
  offline: { color: 'red', text: 'Няма връзка' },
} as const;

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });

const initials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

interface BubbleProps {
  message: ChatMessage;
  mine: boolean;
}

const Bubble: React.FC<BubbleProps> = ({ message, mine }) => (
  <div
    style={{
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      flexDirection: mine ? 'row-reverse' : 'row',
    }}
  >
    <Tooltip title={message.author.full_name}>
      <Avatar style={{ backgroundColor: mine ? '#1677ff' : '#001529', flexShrink: 0 }}>
        {initials(message.author.full_name)}
      </Avatar>
    </Tooltip>

    <div style={{ maxWidth: '70%' }}>
      <div
        style={{
          background: mine ? '#1677ff' : '#f0f0f0',
          color: mine ? '#fff' : 'inherit',
          padding: '8px 12px',
          borderRadius: 12,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {!mine && (
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
            {message.author.full_name}
          </div>
        )}
        {message.content}
      </div>
      <div style={{ fontSize: 11, opacity: 0.55, textAlign: mine ? 'right' : 'left' }}>
        {formatTime(message.created_at)}
      </div>
    </div>
  </div>
);

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const me = useMemo(() => getUser(), []);
  const { messages, online, status, error, send } = useChatSocket();

  const [draft, setDraft] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (): void => {
    const content = draft.trim();
    if (!content || status !== 'online') return;
    if (send(content)) setDraft('');
  };

  const handleLogout = (): void => {
    clearSession();
    navigate(ROUTES.login, { replace: true });
  };

  const statusInfo = STATUS_LABEL[status];

  return (
    <Layout style={{ height: '100vh' }}>
      <Header
        style={{
          background: '#001529',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          gap: 12,
        }}
      >
        <Title level={5} style={{ color: '#fff', margin: 0 }}>
          Групов чат
        </Title>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Badge color={statusInfo.color} text={<Text style={{ color: '#fff' }}>{statusInfo.text}</Text>} />

          <Tooltip title={online.map((u) => u.full_name).join(', ') || 'Никой друг не е на линия'}>
            <Text style={{ color: '#fff', whiteSpace: 'nowrap' }}>
              <TeamOutlined /> {online.length}
            </Text>
          </Tooltip>

          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: '#fff' }}>
            Изход
          </Button>
        </div>
      </Header>

      <Content style={{ overflowY: 'auto', padding: 16, background: '#fff' }}>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} />}

        {messages.length === 0 ? (
          <Empty description="Още няма съобщения. Напиши първото!" style={{ marginTop: 64 }} />
        ) : (
          messages.map((message) => (
            <Bubble key={message.id} message={message} mine={message.author.id === me?.id} />
          ))
        )}

        <div ref={bottomRef} />
      </Content>

      <Footer style={{ padding: 12, background: '#fafafa' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input.TextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onPressEnter={(e) => {
              // Enter sends, Shift+Enter starts a new line.
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Напиши съобщение…"
            maxLength={MAX_MESSAGE_LENGTH}
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={status !== 'online'}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={status !== 'online' || draft.trim().length === 0}
          >
            Изпрати
          </Button>
        </div>
      </Footer>
    </Layout>
  );
};

export default ChatPage;
