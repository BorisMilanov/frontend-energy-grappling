import React from 'react';
import { Row, Col, Typography, Card, Tag, Avatar } from 'antd';
import { Users, Trophy, Award, Star } from 'lucide-react';
import { useScrollReveal, revealStyle } from '../hooks/useScrollReveal';
import trenerImg from '../assets/trener.jpg';

const { Title, Paragraph, Text } = Typography;

const TrainerSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="trainer" style={{ padding: '90px 10%', background: '#fafafa' }}>
      <div ref={ref} style={revealStyle(isVisible)}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Tag color="blue" style={{ fontSize: 14, padding: '6px 18px', marginBottom: 12 }}>
            Треньор
          </Tag>
          <Title level={2} style={{ marginBottom: 0 }}>Запознай се с треньора</Title>
        </div>

        <Row gutter={[48, 40]} align="middle" justify="center">

          {/* Avatar */}
          <Col xs={24} sm={24} md={8} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                size={340}
                src={trenerImg}
              >
                EG
              </Avatar>
              {/* Belt badge */}
              <div style={{
                position: 'absolute', bottom: 8, right: -10,
                background: '#8B4513', borderRadius: 20,
                padding: '4px 12px', color: 'white',
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                border: '2px solid white',
              }}>
                BJJ Brown Belt
              </div>
            </div>
          </Col>

          {/* Info card */}
          <Col xs={24} sm={24} md={16}>
            <Card
              bordered={false}
              style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
            >
              <Title level={3} style={{ marginBottom: 4 }}>Димитър Николов</Title>
              <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 20 }}>
                Главен треньор · Energy Grappling
              </Paragraph>

              {/* Stats */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[
                  { icon: <Award size={20} />, label: 'Опит', value: '10+ години' },
                  { icon: <Star size={20} />, label: 'Клас', value: 'Всички нива' },
                  { icon: <Users size={20} />, label: 'Ученици', value: '30+ активни' },
                  { icon: <Trophy size={18} />, label: 'Турнири', value: 'Национални & Международни' },
                ].map((item, i) => (
                  <Col xs={12} sm={12} md={12} lg={6} key={i}>
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      textAlign: 'center', padding: '14px 10px',
                      background: '#f0f7ff', borderRadius: 12,
                    }}>
                      <div style={{ color: '#1890ff', marginBottom: 6 }}>{item.icon}</div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
                        {item.label}
                      </Text>
                      <Text strong style={{ fontSize: 13 }}>{item.value}</Text>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Bio */}
              <Paragraph style={{ fontSize: 15, color: '#444', lineHeight: 1.8, marginBottom: 0 }}>
                Димитър Николов е главният треньор на Energy Grappling и е страстен бразилско жиу жицу  практик с над 6 години опит.
                С неговия уникален подход и дух завоюва множество спечелени турнири в
                България и Европа като най-значима победа е ADCC EUROPEAN MIDDLE EAST AND AFRICAN през 2024 година и това го прави първия българин, който е спечелил тази титла.
                Чрез силния си състезателен дух ни показва какво е да си победител, не само на татамито, но и в живота. 
                Димитър Николов e известен със своята всеотдайност към учениците си и способността си да адаптира тренировките според индивидуалните нужди и цели на всеки практик. 
                Той вярва в изграждането на силна общност и насърчава сътрудничеството и взаимната подкрепа сред своите ученици.

              </Paragraph>
            </Card>
          </Col>

        </Row>
      </div>
    </section>
  );
};

export default TrainerSection;
