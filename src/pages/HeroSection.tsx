// import React from 'react';
// import { Typography, Button, Space } from 'antd';
// import { InstagramOutlined } from '@ant-design/icons';
// import herohomeImage from '../assets/herohome.jpg';

// const { Title, Paragraph } = Typography;

// const HeroSection: React.FC = () => {
//   return (
// <div style={{
//   backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${herohomeImage})`,
//   backgroundSize: 'cover',
//   backgroundPosition: 'center',
//   backgroundRepeat: 'no-repeat',
//   height: '70vh',
//   width: '100%', 
//   display: 'flex',
//   flexDirection: 'column', 
//   alignItems: 'center',
//   justifyContent: 'center',
//   textAlign: 'center',
//   color: 'white',
//   padding: '0 20px',
//   margin: '0' 
// }}>
//       <div style={{ maxWidth: '800px' }}>
      
//         <Title style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: '24px' }}>
//           ПРОМЕНИ ЖИВОТА СИ С <br/> 
//           <span style={{ color: '#1890ff' }}>БРАЗИЛСКО ЖИУ-ЖИЦУ</span>
//         </Title>
//         <Paragraph style={{ color: 'white', fontSize: '1.2rem', marginBottom: '40px' }}>
//           Добре дошли в най-гостоприемната зала за бойни изкуства. 
//           Започни своето пътешествие днес!
//         </Paragraph>
//         <Space size="large" wrap>
//           <Button type="primary" size="large" style={{ height: '50px', padding: '0 40px' }}>
//             ЗАПИШИ СЕ СЕГА
//           </Button>
//           <Button ghost size="large" style={{ height: '50px' }}>
//            График на тренировките
//           </Button>
//         </Space>

//         {/* Social links */}
//         <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 20 }}>
//           <a
//             href="https://www.instagram.com/energygrapplingteam/"
//             target="_blank"
//             rel="noopener noreferrer"
//             style={{
//               display: 'flex', alignItems: 'center', gap: 8,
//               color: 'white', fontSize: 16, textDecoration: 'none',
//               background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
//               padding: '8px 20px', borderRadius: 24,
//               transition: 'opacity 0.2s',
//             }}
//             onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
//             onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
//           >
//             <InstagramOutlined style={{ fontSize: 20 }} />
//             @energygrapplingteam
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HeroSection;