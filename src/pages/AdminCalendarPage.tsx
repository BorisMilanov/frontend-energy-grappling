import React, { useEffect, useState } from 'react';
import {
  Layout, Typography, Button, Table, Modal, Form, Input,
  DatePicker, Select, Tag, Space, Popconfirm, message, ConfigProvider,
  Menu, Dropdown,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import dayjs, { type Dayjs } from 'dayjs';
import { calendarApi, type CalendarEvent, type CalendarEventPayload, type EventType } from '../services/calendarApi';
import { authStorage } from '../services/authApi';

const { Header, Content } = Layout;
const { Title } = Typography;

const TYPE_OPTIONS = [
  { value: 'seminar', label: 'Семинар' },
  { value: 'success', label: 'Основи (Gi)' },
  { value: 'warning', label: 'No-Gi' },
  { value: 'error', label: 'Отменено' },
  { value: 'default', label: 'Друго' },
];

const TYPE_COLOR: Record<string, string> = {
  seminar: 'purple',
  success: 'green',
  warning: 'orange',
  error: 'red',
  default: 'default',
};

interface FormValues {
  title: string;
  date: Dayjs;
  type: EventType;
}

const AdminCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authStorage.getUser);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form] = Form.useForm<FormValues>();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      setEvents(await calendarApi.getAll());
    } catch {
      message.error('Грешка при зареждане на събитията.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditing(ev);
    form.setFieldsValue({ title: ev.title, date: dayjs(ev.date), type: ev.type });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload: CalendarEventPayload = {
        title: values.title,
        date: values.date.toISOString(),
        type: values.type,
      };
      if (editing) {
        await calendarApi.update(editing.id, payload);
        message.success('Събитието е обновено.');
      } else {
        await calendarApi.create(payload);
        message.success('Събитието е създадено.');
      }
      setModalOpen(false);
      fetchEvents();
    } catch {
      message.error('Грешка при запазване.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await calendarApi.delete(id);
      message.success('Събитието е изтрито.');
      fetchEvents();
    } catch {
      message.error('Грешка при изтриване.');
    }
  };

  const handleLogout = () => {
    authStorage.clear();
    setUser(null);
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (d: string) => dayjs(d).format('DD.MM.YYYY'),
      sorter: (a: CalendarEvent, b: CalendarEvent) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Заглавие',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (t: string) => {
        const opt = TYPE_OPTIONS.find(o => o.value === t);
        return <Tag color={TYPE_COLOR[t]}>{opt?.label ?? t}</Tag>;
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: unknown, record: CalendarEvent) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            Редактирай
          </Button>
          <Popconfirm
            title="Изтрий събитието?"
            okText="Да"
            cancelText="Не"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              Изтрий
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff', borderRadius: 8 } }}>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header style={{
          position: 'fixed', zIndex: 1000, width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 50px', background: '#001529', height: 64,
        }}>
          <div
            style={{ color: 'white', fontWeight: 'bold', fontSize: 20, cursor: 'pointer' }}
            
          >
            Energy Grappling
          </div>

          <Menu
               theme="dark"
               mode="horizontal"
               selectedKeys={['/admin/calendar']}
               items={[
                 { key: '/calendar', label: 'Календар' },
                 { key: '/members', label: 'Членове' },
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

          {user && (
            <Dropdown
              menu={{
                items: [
                  { key: 'logout', label: 'Изход', icon: <LogoutOutlined />, onClick: handleLogout },
                ],
              }}
              placement="bottomRight"
            >
              <Button type="text" icon={<UserOutlined />} style={{ color: 'white', fontWeight: 600 }}>
                {user.firstName}
              </Button>
            </Dropdown>
          )}
        </Header>

        <Content style={{ marginTop: 64, padding: '40px 10%' }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Title level={3} style={{ margin: 0 }}>Управление на календара</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Добави събитие
              </Button>
            </div>

            <Table
              rowKey="id"
              dataSource={events}
              columns={columns}
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </div>
        </Content>

        <Modal
          title={editing ? 'Редактирай събитие' : 'Ново събитие'}
          open={modalOpen}
          onOk={handleSave}
          onCancel={() => setModalOpen(false)}
          okText="Запази"
          cancelText="Отказ"
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="title" label="Заглавие" rules={[{ required: true, message: 'Въведи заглавие' }]}>
              <Input placeholder="напр. Основи 17:00" />
            </Form.Item>
            <Form.Item name="date" label="Дата" rules={[{ required: true, message: 'Избери дата' }]}>
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
            </Form.Item>
            <Form.Item name="type" label="Тип" initialValue="seminar" rules={[{ required: true }]}>
              <Select options={TYPE_OPTIONS} />
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminCalendarPage;
