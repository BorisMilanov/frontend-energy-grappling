import React, { useEffect, useState } from 'react';
import {
  Layout, Typography, Button, Card, Modal, Form, Input,
  Select, Avatar, Popconfirm, message, ConfigProvider,
  Menu, Dropdown, Row, Col, Empty, Spin,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { membersApi, type Member, type MemberPayload, type Belt } from '../services/membersApi';
import { authStorage } from '../services/authApi';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface BeltOption {
  value: Belt;
  label: string;
  color: string;
  textColor: string;
}

const BELT_OPTIONS: BeltOption[] = [
  { value: 'white', label: 'Бял колан', color: '#f0f0f0', textColor: '#000' },
  { value: 'blue', label: 'Син колан', color: '#1677ff', textColor: '#fff' },
  { value: 'purple', label: 'Лилав колан', color: '#722ed1', textColor: '#fff' },
  { value: 'brown', label: 'Кафяв колан', color: '#7c3a16', textColor: '#fff' },
  { value: 'black', label: 'Черен колан', color: '#1f1f1f', textColor: '#fff' },
];

const BELT_MAP: Record<Belt, BeltOption> = BELT_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.value]: opt }),
  {} as Record<Belt, BeltOption>,
);

interface FormValues {
  name: string;
  belt: Belt;
}

const BeltBadge: React.FC<{ belt: Belt }> = ({ belt }) => {
  const opt = BELT_MAP[belt] ?? BELT_OPTIONS[0];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 12px',
        borderRadius: 6,
        background: opt.color,
        color: opt.textColor,
        border: belt === 'white' ? '1px solid #d9d9d9' : 'none',
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <span
        style={{
          width: 24,
          height: 8,
          borderRadius: 2,
          background: belt === 'black' ? '#000' : opt.color,
          border: belt === 'white' ? '1px solid #bfbfbf' : '1px solid rgba(0,0,0,0.2)',
        }}
      />
      {opt.label}
    </div>
  );
};

const AdminMembersPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authStorage.getUser);
  const isAdmin = authStorage.isAdmin();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form] = Form.useForm<FormValues>();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      setMembers(await membersApi.getAll());
    } catch {
      message.error('Грешка при зареждане на членовете.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    form.setFieldsValue({ name: m.name, belt: m.belt });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload: MemberPayload = { name: values.name, belt: values.belt };
      if (editing) {
        await membersApi.update(editing.id, payload);
        message.success('Членът е обновен.');
      } else {
        await membersApi.create(payload);
        message.success('Членът е създаден.');
      }
      setModalOpen(false);
      fetchMembers();
    } catch (err) {
      if (err instanceof Error && err.message) message.error(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await membersApi.delete(id);
      message.success('Членът е изтрит.');
      fetchMembers();
    } catch {
      message.error('Грешка при изтриване.');
    }
  };

  const handleLogout = () => {
    authStorage.clear();
    setUser(null);
    navigate('/');
  };

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
            selectedKeys={['/admin/members']}
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
              <Title level={3} style={{ margin: 0 }}>Членове на клуба</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Добави член
              </Button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
              </div>
            ) : members.length === 0 ? (
              <Empty description="Няма добавени членове" style={{ padding: '40px 0' }} />
            ) : (
              <Row gutter={[24, 24]}>
                {members.map((m) => (
                  <Col key={m.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      actions={[
                        <EditOutlined key="edit" onClick={() => openEdit(m)} />,
                        <Popconfirm
                          key="delete"
                          title="Изтрий члена?"
                          okText="Да"
                          cancelText="Не"
                          onConfirm={() => handleDelete(m.id)}
                        >
                          <DeleteOutlined style={{ color: '#ff4d4f' }} />
                        </Popconfirm>,
                      ]}
                    >
                      <Card.Meta
                        avatar={
                          <Avatar
                            size={56}
                            style={{ background: BELT_MAP[m.belt]?.color ?? '#1890ff', color: BELT_MAP[m.belt]?.textColor ?? '#fff' }}
                          >
                            {m.name.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={<Text strong style={{ fontSize: 16 }}>{m.name}</Text>}
                        description={<BeltBadge belt={m.belt} />}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Content>

        <Modal
          title={editing ? 'Редактирай член' : 'Нов член'}
          open={modalOpen}
          onOk={handleSave}
          onCancel={() => setModalOpen(false)}
          okText="Запази"
          cancelText="Отказ"
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="name" label="Име" rules={[{ required: true, message: 'Въведи име' }]}>
              <Input placeholder="напр. Иван Петров" />
            </Form.Item>
            <Form.Item name="belt" label="Колан" initialValue="white" rules={[{ required: true, message: 'Избери колан' }]}>
              <Select
                options={BELT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminMembersPage;
