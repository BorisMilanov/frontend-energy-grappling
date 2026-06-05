import React, { useEffect, useState } from 'react';
import {
  Layout, Calendar, Badge, Typography, ConfigProvider,
  Menu, Button, Space, Dropdown, Grid,
} from 'antd';
import { LeftOutlined, RightOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import type { BadgeProps, CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';
import { authStorage } from '../services/authApi';
import { calendarApi, type CalendarEvent } from '../services/calendarApi';
import { scheduleData, buildWeeklySchedule } from '../data/scheduleData';

const { useBreakpoint } = Grid;
const { Header, Content } = Layout;
const { Title, Text } = Typography;

const SEMINAR_COLOR = 'purple';

const EVENT_TYPE_LABEL: Record<string, string> = {
  seminar: 'Семинар',
  success: 'Основи (Gi)',
  warning: 'No-Gi',
  error: 'Отменено',
};

const WEEKLY_SCHEDULE = buildWeeklySchedule(scheduleData);

const getMonday = (d: Dayjs) => {
  const day = d.day();
  return d.subtract((day + 6) % 7, 'day').startOf('day');
};

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [user, setUser] = useState(authStorage.getUser);
  const isAdmin = authStorage.isAdmin();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [weekStart, setWeekStart] = useState(() => getMonday(dayjs()));
  const [selectedDay, setSelectedDay] = useState<Dayjs>(dayjs().startOf('day'));

  useEffect(() => {
    calendarApi.getAll().then(setEvents).catch(() => {});
  }, []);

  const handleLogout = () => {
    authStorage.clear();
    setUser(null);
    navigate('/');
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type !== 'date') return info.originNode;
    const dayEvents = events.filter(ev => dayjs(ev.date).isSame(current, 'day'));
    const scheduled = WEEKLY_SCHEDULE[current.day()];
    if (!dayEvents.length && !scheduled) return null;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {scheduled && (
          <li key="schedule">
            <Badge status={scheduled.status} text={`${scheduled.time} ${scheduled.label}`} />
          </li>
        )}
        {dayEvents.map((ev) =>
          ev.type === 'seminar' ? (
            <li key={ev.id}><Badge color={SEMINAR_COLOR} text={ev.title} /></li>
          ) : (
            <li key={ev.id}><Badge status={ev.type as BadgeProps['status']} text={ev.title} /></li>
          )
        )}
      </ul>
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  const selectedDayEvents = events.filter(ev => dayjs(ev.date).isSame(selectedDay, 'day'));
  const selectedDaySchedule = WEEKLY_SCHEDULE[selectedDay.day()];
  const today = dayjs().startOf('day');

  const mobileCalendar = (
    <div>
      {/* Week navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => setWeekStart(d => d.subtract(1, 'week'))}
        />
        <Text strong style={{ fontSize: 15 }}>
          {weekStart.format('MMMM YYYY')}
        </Text>
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={() => setWeekStart(d => d.add(1, 'week'))}
        />
      </div>

      {/* 7-day strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {weekDays.map((day, i) => {
          const isToday = day.isSame(today, 'day');
          const isSelected = day.isSame(selectedDay, 'day');
          const hasEvents = events.some(ev => dayjs(ev.date).isSame(day, 'day')) || !!WEEKLY_SCHEDULE[day.day()];
          return (
            <div
              key={day.toString()}
              onClick={() => setSelectedDay(day)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 2px',
                borderRadius: 10,
                cursor: 'pointer',
                background: isSelected ? '#1890ff' : isToday ? '#e6f4ff' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <Text style={{ fontSize: 11, color: isSelected ? '#fff' : '#888' }}>
                {DAY_NAMES[i]}
              </Text>
              <Text strong style={{ fontSize: 16, color: isSelected ? '#fff' : isToday ? '#1890ff' : '#222', lineHeight: '1.6' }}>
                {day.format('D')}
              </Text>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: hasEvents ? (isSelected ? '#fff' : '#1890ff') : 'transparent',
                marginTop: 2,
              }} />
            </div>
          );
        })}
      </div>

      {/* Events for selected day */}
      <div style={{ marginTop: 20 }}>
        <Text strong style={{ fontSize: 14, color: '#555' }}>
          {selectedDay.format('D MMMM')}
        </Text>
        {!selectedDaySchedule && selectedDayEvents.length === 0 ? (
          <div style={{ marginTop: 12, color: '#aaa', textAlign: 'center', padding: '24px 0' }}>
            Няма събития
          </div>
        ) : (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedDaySchedule && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: '#f5f5f5',
                borderLeft: `4px solid ${selectedDaySchedule.status === 'success' ? '#52c41a' : '#faad14'}`,
              }}>
                <Text strong style={{ fontSize: 14 }}>{selectedDaySchedule.label}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 12, color: '#888' }}>{selectedDaySchedule.time}</Text>
                </div>
              </div>
            )}
            {selectedDayEvents.map(ev => (
              <div key={ev.id} style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: '#f5f5f5',
                borderLeft: `4px solid ${ev.type === 'seminar' ? SEMINAR_COLOR : ev.type === 'success' ? '#52c41a' : ev.type === 'warning' ? '#faad14' : '#ff4d4f'}`,
              }}>
                <Text strong style={{ fontSize: 14 }}>{ev.title}</Text>
                <div style={{ marginTop: 4 }}>
                  <Badge
                    color={ev.type === 'seminar' ? SEMINAR_COLOR : undefined}
                    status={ev.type !== 'seminar' ? ev.type as BadgeProps['status'] : undefined}
                    text={<Text style={{ fontSize: 12, color: '#888' }}>{EVENT_TYPE_LABEL[ev.type] ?? ev.type}</Text>}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff', borderRadius: 8 } }}>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header style={{
          position: 'fixed', zIndex: 1000, width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 50px', background: '#001529', height: 64,
        }}>
          <div
            style={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? 16 : 20, cursor: 'pointer', flexShrink: 0 }}
            onClick={() => navigate('/')}
          >
            Energy Grappling
          </div>

          {!isMobile && (
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={['/calendar']}
              items={[
                { key: '/calendar', label: 'Календар' },
                // { key: '/members', label: 'Членове' },
                ...(isAdmin
                  ? [
                      { key: '/admin/calendar', label: 'Календар (админ)' },
                      { key: '/admin/members', label: 'Членове (админ)' },
                    ]
                  : []),
              ]}
              onClick={(e) => navigate(e.key)}
              style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end', borderBottom: 'none', marginRight: 16 }}
            />
          )}

          {user ? (
            <Dropdown
              menu={{
                items: [{ key: 'logout', label: 'Изход', icon: <LogoutOutlined />, onClick: handleLogout }],
              }}
              placement="bottomRight"
            >
              <Button type="text" icon={<UserOutlined />} style={{ color: 'white', fontWeight: 600 }}>
                {!isMobile && user.firstName}
              </Button>
            </Dropdown>
          ) : (
            <Space size={isMobile ? 4 : 8}>
              <Button type="text" style={{ color: 'white', padding: isMobile ? '0 8px' : undefined }} onClick={() => navigate('/login')}>Влез</Button>
              {!isMobile && <Button type="primary" onClick={() => navigate('/register')}>Регистрация</Button>}
            </Space>
          )}
        </Header>

        <Content style={{ marginTop: 64, padding: isMobile ? '16px 8px' : '40px 10%' }}>
          <div style={{
            background: '#fff',
            borderRadius: isMobile ? 8 : 16,
            padding: isMobile ? '16px 12px' : '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <Title level={isMobile ? 4 : 3} style={{ marginBottom: isMobile ? 12 : 24 }}>
              График на тренировките
            </Title>

            {!isMobile && (
              <div style={{ marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <Badge color={SEMINAR_COLOR} text="Семинар" />
                <Badge status="success" text="Основи (Gi)" />
                <Badge status="warning" text="No-Gi" />
                <Badge status="error" text="Отменено" />
              </div>
            )}

            {isMobile ? mobileCalendar : <Calendar cellRender={cellRender} />}
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default CalendarPage;
