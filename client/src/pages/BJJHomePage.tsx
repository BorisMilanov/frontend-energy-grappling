import React, { useEffect, useState } from 'react';
import {
  Layout, Menu, Button, Row, Col, Typography, Card, Table,
  Space, ConfigProvider, Tag, Grid, Modal,
} from 'antd';

const { useBreakpoint } = Grid;
import type { ColumnsType } from 'antd/es/table';
import { Users, ShieldCheck, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MenuOutlined, CloseOutlined, LogoutOutlined } from '@ant-design/icons';
import herohomeImage from '../assets/team.jpg';
import troyClubImage from '../assets/maint.jpg';
import eventPoster from '../assets/event.png';
import sinanTrainerImage from '../assets/SinanTrainer.png';
import djaniTrainerImage from '../assets/DjaniTrener.png';
import { clearSession, getUser } from '../services/authApi';
import { ROUTES } from '../routes';
import { scheduleData, type ScheduleItem } from '../data/scheduleData';
import { useScrollReveal, revealStyle } from '../hooks/useScrollReveal';
import TrainerSection, { TrainerProfile } from './TrainerSection';
import Footer from './Footer';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;



const BJJHomePage: React.FC = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scheduleHover, setScheduleHover] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  useEffect(() => {
    setEventModalOpen(true);
  }, []);

  const { ref: benefitsRef, isVisible: benefitsVisible } = useScrollReveal();
  const { ref: scheduleRef, isVisible: scheduleVisible } = useScrollReveal();
  const { ref: troyRef, isVisible: troyVisible } = useScrollReveal();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollReveal();

  const columns: ColumnsType<ScheduleItem> = [
    { title: 'Час', dataIndex: 'time', key: 'time', fixed: 'left', width: 130 },
    { title: 'Пон', dataIndex: 'mon', key: 'mon' },
    { title: 'Вт', dataIndex: 'tue', key: 'tue' },
    { title: 'Ср', dataIndex: 'wed', key: 'wed' },
    { title: 'Чет', dataIndex: 'thu', key: 'thu' },
    { title: 'Пет', dataIndex: 'fri', key: 'fri' },
  ];

  const troyScheduleData: ScheduleItem[] = [
    { key: 'troy-1', time: '17:30 - 18:30', mon: 'Основи на граплинга', tue: '', wed: 'Спаринги/ Напреднали', thu: '', fri: 'Основи на граплинга' },
  ];

  const renderSchedule = (data: ScheduleItem[], disablePointerEvents = false) => {
    if (isMobile) {
      return (
        <div style={{ display: 'grid', gap: 12 }}>
          {data.map((item) => (
            <Card key={item.key} size="small" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Text strong style={{ display: 'block', fontSize: 16, color: '#1890ff', marginBottom: 12 }}>
                {item.time}
              </Text>
              <Row gutter={[8, 8]}>
                {[
                  ['Понеделник', item.mon],
                  ['Вторник', item.tue],
                  ['Сряда', item.wed],
                  ['Четвъртък', item.thu],
                  ['Петък', item.fri],
                ].filter(([, training]) => training).map(([day, training]) => (
                  <Col xs={24} key={day}>
                    <div style={{ background: '#f0f7ff', borderRadius: 8, padding: '10px 12px' }}>
                      <Text strong>{day}</Text>
                      <Text type="secondary" style={{ display: 'block', marginTop: 2 }}>{training}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        bordered
        scroll={{ x: 700 }}
        style={{
          boxShadow: scheduleHover ? '0 8px 24px rgba(24,144,255,0.15)' : '0 4px 12px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.3s ease',
          pointerEvents: disablePointerEvents ? 'none' : undefined,
        }}
      />
    );
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  // Re-read on every render so the bar flips right after login / logout.
  const currentUser = getUser();

  // No Вход / Регистрация entries: the auth pages stay reachable by URL only.
  const publicNavItems = [
    { key: 'hero', label: 'Начало' },
    { key: 'schedule', label: 'График' },
    { key: 'trainer', label: 'Треньорите' },
    { key: 'contact', label: 'Контакти' },
    { key: 'calendar-link', label: 'Календар' },
    ...(currentUser ? [{ key: 'logout', label: 'Изход', icon: <LogoutOutlined /> }] : []),
  ];


  const navMenuClick = (e: { key: string }) => {
    if (e.key === 'calendar-link') navigate(ROUTES.calendar);
    else if (e.key === 'logout') {
      clearSession();
      navigate(ROUTES.login);
    } else if (e.key.startsWith('/')) navigate(e.key);
    else scrollTo(e.key);
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff', borderRadius: 8 } }}>
      <Layout style={{ minHeight: '100vh', background: '#fff' }}>
        <Header style={{
          position: 'fixed', zIndex: 1000, width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 50px', background: '#001529', height: 64,
        }}>
          <div
            style={{ color: 'white', fontWeight: 'bold', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => scrollTo('hero')}
          >
           Energy Grappling
          </div>
          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
            <Menu
              theme="dark" mode="horizontal"
              defaultSelectedKeys={['hero']}
              items={publicNavItems}
              disabledOverflow
              onClick={navMenuClick}
              style={{ borderBottom: 'none', justifyContent: 'flex-end' }}
            />
          </div>

          <div
            className="mobile-burger"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'white', fontSize: 22, cursor: 'pointer', display: 'none' }}
          >
            {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          </div>
        </Header>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div style={{
            position: 'fixed', top: 64, left: 0, width: '100%',
            background: '#001529', zIndex: 999, borderTop: '1px solid #002140',
          }}>
            <Menu
              theme="dark" mode="vertical"
              items={publicNavItems}
              onClick={navMenuClick}
              style={{ borderRight: 'none' }}
            />
          </div>
        )}

        <Content style={{ marginTop: 64 }}>

          {/* ── HERO ── */}
          <div id="hero" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${herohomeImage})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            height: '90vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center', color: 'white', padding: '0 20px',
          }}>
            <div style={{ maxWidth: 800 }}>
              <Title style={{ color: 'white', fontSize: 'clamp(32px,5vw,60px)', marginBottom: 24 }}>
                ПРОМЕНИ ЖИВОТА СИ С <br />
                <span style={{ color: '#1890ff' }}>БРАЗИЛСКО ЖИУ-ЖИЦУ</span>
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', marginBottom: 40 }}>
                Добре дошли в най-гостоприемната зала за бойни изкуства.
                Започни своето пътешествие днес!
              </Paragraph>
              <Space
                direction={isMobile ? 'vertical' : 'horizontal'}
                size="large"
                style={isMobile ? { display: 'flex', alignItems: 'center', width: '100%' } : undefined}
              >
                <Button type="primary" size="large" style={{ height: 50, ...(isMobile && { width: 240 }) }} onClick={() => navigate(ROUTES.event)}>
                  Информация за събитието
                </Button>
                <Button ghost size="large" style={{ height: 50, ...(isMobile && { width: 240 }) }} onClick={() => scrollTo('schedule')}>
                  График на тренировките
                </Button>
              </Space>
            </div>
          </div>

          {/* ── BENEFITS ── */}
          <section id="programs" style={{ padding: '90px 10%' }}>
            <div ref={benefitsRef}>
              <Row gutter={[32, 32]} justify="center">
                {[
                  { icon: <ShieldCheck size={40} />, title: 'Самозащита', text: 'Реални умения за реални ситуации.', delay: 0 },
                  { icon: <Trophy size={40} />, title: 'Успех', text: 'Изгради шампионска нагласа в живота.', delay: 120 },
                  { icon: <Users size={40} />, title: 'Общност', text: 'Намери приятели за цял живот на татамито.', delay: 240 },
                ].map((item, i) => (
                  <Col xs={24} md={8} key={i}>
                    <div style={revealStyle(benefitsVisible, item.delay)}>
                      <Card bordered={false} style={{ textAlign: 'center', background: '#fafafa', borderRadius: 16 }}>
                        <div style={{ color: '#1890ff', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                          {item.icon}
                        </div>
                        <Title level={3}>{item.title}</Title>
                        <Paragraph type="secondary">{item.text}</Paragraph>
                      </Card>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* ── SCHEDULE (GRAPHIC) — clickable, scroll-reveal ── */}
          <section
            id="schedule"
            ref={scheduleRef}
            onClick={() => navigate('/graphic')}
            onMouseEnter={() => setScheduleHover(true)}
            onMouseLeave={() => setScheduleHover(false)}
            style={{
              ...revealStyle(scheduleVisible),
              padding: '70px 10%',
              background: scheduleHover ? '#f0f7ff' : '#fff',
              cursor: 'pointer',
              transition: [
                `opacity 0.65s ease`,
                `transform 0.65s ease`,
                `background 0.3s ease`,
              ].join(', '),
              outline: scheduleHover ? '2px solid #1890ff' : '2px solid transparent',
              outlineOffset: -2,
              borderRadius: 0,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Tag color="blue"  style={{ fontSize: 22, padding: '14px 24px', marginBottom: 12 }}>График</Tag>
              <Title level={2}>График на тренировките</Title>
              {scheduleHover && (
                <Text type="secondary" style={{ fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Виж пълния график <ArrowRight size={16} />
                </Text>
              )}
            </div>
            {renderSchedule(scheduleData, true)}
          </section>

          {/* ── TRAINER ── */}
          <TrainerSection />

          {/* ── TROY CLUB ── */}
          <section
            id="troy-club"
            ref={troyRef}
            style={{
              ...revealStyle(troyVisible),
              padding: '90px 10%',
              background: '#fff',
            }}
          >
            <Row gutter={[48, 40]} align="middle" justify="center">
              <Col xs={24} md={12}>
                <img
                  src={troyClubImage}
                  alt="Energy Grappling в Троян"
                  style={{ width: '100%', display: 'block', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                />
              </Col>
              <Col xs={24} md={12}>
                <Tag color="blue" style={{ fontSize: 14, padding: '6px 18px', marginBottom: 12 }}>
                  Energy Grappling Троян
                </Tag>
                <Title level={2}>Тренирай с нас и в Троян</Title>
                <Paragraph style={{ fontSize: 17, lineHeight: 1.8, marginBottom: 0 }}>
                  Energy Grappling вече е и в Троян. Очакват те качествени тренировки по бразилско жиу-жицу, приятелска атмосфера и общност,
                   в която всеки може да започне и да се развива. Можеш да се развиеш в перфектната среда и да получиш неубходимото внимание и подкрепа 
                  за да постигнеш целите си. Присъедини се към нас и започни своето пътешествие в света на бойните изкуства.

                </Paragraph>
              </Col>
            </Row>
            <TrainerProfile
              name="Синан Асенов"
              role="Треньор и състезател · Energy Grappling Троян"
              experience="5 години"
              bio="Синан Асенов е треньор и състезател в Energy Grappling Троян. Той помага на всеки трениращ да изгражда стабилни основи и увереност на татамито."
              imageSrc={sinanTrainerImage}
              beltLabel="BJJ Blue Belt"
              beltColor="#1890ff"
            />
            <TrainerProfile
              name="Джани Асенов"
              role="Треньор и състезател · Energy Grappling Троян"
              experience="5 години"
              bio="Джани Асенов е треньор и състезател в Energy Grappling Троян. Работи с практикуващи от всички нива и подкрепя развитието им в бразилското жиу-жицу."
              imageSrc={djaniTrainerImage}
            />
            <div style={{ marginTop: 56 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <Tag color="blue" style={{ fontSize: 14, padding: '6px 18px', marginBottom: 12 }}>
                  График за Троян
                </Tag>
                <Title level={3} style={{ margin: 0 }}>График на тренировките</Title>
              </div>
              {renderSchedule(troyScheduleData)}
            </div>
          </section>

          {/* ── CTA ── */}
          <section
            id="contact"
            style={{
              ...revealStyle(ctaVisible),
              padding: '100px 20px',
              background: '#001529',
              textAlign: 'center',
            }}
          >
            <div ref={ctaRef}>
              <Title level={2} style={{ color: 'white', marginBottom: 24 }}>
                Не знаеш откъде да започнеш?
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginBottom: 32 }}>
                Ела на място, разгледай залата.
              </Paragraph>
              <Button type="primary" size="middle" icon={<CheckCircle2 size={20} />} style={{ height: 54, display: 'flex', alignItems: 'center', margin: '0 auto' }}>
                ЗАПИШИ СЕ СЕГА
              </Button>
            </div>
          </section>
        </Content>

        {/* ── FOOTER ── */}
        <Footer />
      </Layout>

      <Modal
        open={eventModalOpen}
        onCancel={() => setEventModalOpen(false)}
        centered
        width={420}
        destroyOnHidden
        title="Събитие"
        footer={[
          <Button key="more" type="primary" onClick={() => {
            setEventModalOpen(false);
            navigate(ROUTES.event);
          }}>
            Информация за събитието
          </Button>,
        ]}
      >
        <img
          src={eventPoster}
          alt="Event poster"
          style={{ width: '100%', borderRadius: 12, display: 'block' }}
        />
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: block !important; }
        }
      `}</style>
    </ConfigProvider>
  );
};

export default BJJHomePage;
