import React from 'react';
import { Row, Col, Typography, Card, Tag, Avatar } from 'antd';
import { Users, Trophy, Award, Star } from 'lucide-react';
import { useScrollReveal, revealStyle } from '../hooks/useScrollReveal';
import trenerImg from '../assets/trener.jpg';
import trenerImg2 from '../assets/trener2.png';

const { Title, Paragraph, Text } = Typography;

const TrainerSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal();
  const { ref: ref2, isVisible: isVisible2 } = useScrollReveal();

  return (
    <section id="trainer" style={{ padding: '90px 10%', background: '#fafafa' }}>
      <div ref={ref} style={revealStyle(isVisible)}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Tag color="blue" style={{ fontSize: 14, padding: '6px 18px', marginBottom: 12 }}>
            Треньорите
          </Tag>
          <Title level={2} style={{ marginBottom: 0 }}>Запознай се с треньорите</Title>
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
                  { icon: <Award size={20} />, label: 'Опит', value: '6+ години' },
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
              <Paragraph style={{ fontSize: 16, color: '#333', lineHeight: 2, marginBottom: 0, letterSpacing: '0.01em' }}>
                Димитър Николов е главният треньор на Energy Grappling и страстен практик на бразилско жиу жицу с над 6 години опит.
              
                С уникален подход и непреклонен дух, той завоюва множество турнирни победи в България и Европа.
                Най-значимата от тях е титлата на <strong>ADCC European, Middle East and African Championship 2024</strong> - което го прави първия българин, спечелил това отличие.
             
                Чрез силния си състезателен дух ни показва какво означава да си победител — не само на татамито, но и в живота.
                Димитър е известен с всеотдайността си към учениците и умението да адаптира тренировките спрямо индивидуалните нужди и цели на всеки практик.
                Той вярва в изграждането на силна общност и насърчава сътрудничеството и взаимната подкрепа сред своите ученици.
              </Paragraph>
            </Card>
          </Col>

        </Row>
      </div>
       <div ref={ref2} style={revealStyle(isVisible2)}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
        
          
        </div>

        <Row gutter={[48, 40]} align="middle" justify="center">

          {/* Avatar */}
          <Col xs={24} sm={24} md={8} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                size={340}
                src={trenerImg2}
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
              <Title level={3} style={{ marginBottom: 4 }}>Дони Димитров</Title>
              <Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 20 }}>
                Заместник треньор · Energy Grappling
              </Paragraph>

              {/* Stats */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[
                  { icon: <Award size={20} />, label: 'Опит', value: '20+ години' },
                  { icon: <Star size={20} />, label: 'Клас', value: 'Всички нива' },
                  // { icon: <Users size={20} />, label: 'Ученици', value: '30+ активни' },
                  // { icon: <Trophy size={18} />, label: 'Турнири', value: 'Национални & Международни' },
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
              <Paragraph style={{ fontSize: 16, color: '#333', lineHeight: 2, marginBottom: 0, letterSpacing: '0.01em' }}>
                Дони Димитров е заместник треньор на Energy Grappling и страстен практик на бразилско жиу жицу с над 20 години опит.
                Той е първият треньор в Ловеч, който основава ММА зала. Има огромен опит в преподаването на бойни изкуства и е вдъхновение за много млади спортисти в региона.
                Един от най-доказаните треньори в Ловеч. Вниманието му към детайлите го правят изключителен треньор, който помага на учениците си да развият силни основи и да постигнат своите цели в BJJ и MMA.
              </Paragraph>
            </Card>
          </Col>

        </Row>
      </div>
    </section>
    
  );
};

export default TrainerSection;
