import React from 'react';
import { Layout, Typography, Button, Card, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import eventPoster from '../assets/event.png';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const EventPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      <Header style={{
        position: 'fixed', zIndex: 1000, width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: '#001529', height: 64,
      }}>
        <div
          style={{ color: 'white', fontWeight: 'bold', fontSize: 20, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Energy Grappling
        </div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ color: 'white' }}
        >
          Назад
        </Button>
      </Header>

      <Content style={{ marginTop: 64, padding: '40px 20px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: 28 }}>
              <div>
                <img
                  src={eventPoster}
                  alt="Event poster"
                  style={{ width: '100%', borderRadius: 16, display: 'block' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Tag color="blue" style={{ width: 'fit-content', fontSize: 14, padding: '6px 12px' }}>
                  Събитие
                </Tag>
                <Title level={2} style={{ marginTop: 16, marginBottom: 14 }}>
                  Състезание по бразилско жиу-жицу 
                </Title>

                <Paragraph style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
                  Ще се състезават от всеки клуб, най-добрите състезатели. 
                </Paragraph>

                <div style={{ marginBottom: 18 }}>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>Дата:</Text>
                  <Text type="secondary">25 октомври 2026 г.</Text>
                </div>

                {/* <div style={{ marginBottom: 18 }}>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>Място:</Text>
                  <Text type="secondary">Гордж скоол , София</Text>
                </div> */}

                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>Какво включва:</Text>
                  <Text type="secondary">
                    Практически упражнения, техника, работа в двойки и мотивационна атмосфера.
                  </Text>
                </div>

                <Button type="primary" size="large" onClick={() => navigate('/calendar')}>
                  Виж календара
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default EventPage;
