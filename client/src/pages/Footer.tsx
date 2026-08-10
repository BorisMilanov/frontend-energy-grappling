import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { InstagramOutlined, FacebookFilled } from '@ant-design/icons';
import { MapPin, Phone } from 'lucide-react';

const { Footer: AntFooter } = Layout;
const { Title, Paragraph, Text } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ background: '#001529', padding: '48px 8% 24px' }}>
      <Row gutter={[32, 40]}>

        {/* Brand */}
        <Col xs={24} sm={24} md={10}>
          <Title level={5} style={{ color: 'white', marginBottom: 16 }}>Energy Grappling</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 0 }}>
            Ние вярваме, че Бразилското Жиу-Жицу е за всеки – независимо от възраст,
            пол или атлетични възможности. Присъедини се към нас и открий своята сила.
          </Paragraph>
        </Col>

        {/* Location */}
        <Col xs={24} sm={12} md={7}>
          <Title level={5} style={{ color: 'white', marginBottom: 16 }}>Локация</Title>
          <Space direction="vertical" size={10}>
            <Text style={{ color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={15} />&nbsp;ул. търговска 42, Lovech, Bulgaria, 5500
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={15} />&nbsp;+359 88 000 0000
            </Text>
          </Space>
        </Col>

        {/* Social */}
        <Col xs={24} sm={12} md={7}>
          <Title level={5} style={{ color: 'white', marginBottom: 16 }}>Социални мрежи</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a
              href="https://www.instagram.com/energygrapplingteam/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'white', fontSize: 12, textDecoration: 'none',
                background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                padding: '9px 10px', borderRadius: 24,
                transition: 'opacity 0.2s', width: 'fit-content',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <InstagramOutlined style={{ fontSize: 16 }} />
              @energygrapplingteam
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100089051213503"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'white', fontSize: 12, textDecoration: 'none',
                background: '#1877F2',
                padding: '9px 10px', borderRadius: 24,
                transition: 'opacity 0.2s', width: 'fit-content',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <FacebookFilled style={{ fontSize: 16 }} />
              Energy Grappling
            </a>
          </div>
        </Col>

      </Row>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.12)', margin: '32px 0 20px' }} />
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
        © {new Date().getFullYear()} Energy Grappling. Designed with Boris Milanov.
      </div>
    </AntFooter>
  );
};

export default Footer;
