import React from 'react';
import { Table, Tag, Typography, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

const { Title } = Typography;

interface ScheduleItem {
  key: string;
  time: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
}

const ScheduleTable: React.FC = () => {
  const navigate = useNavigate();

  const scheduleData: ScheduleItem[] = [
    { key: '1', time: '17:00 - 18:30', mon: 'MMA', tue: 'No-Gi', wed: 'Gi', thu: 'No-Gi', fri: 'No-Gi' },

  ];

  const colStyle: React.CSSProperties = {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 600,
  };

  const columns: ColumnsType<ScheduleItem> = [
    { title: <span style={{ fontSize: 18 }}>Час</span>, dataIndex: 'time', key: 'time', fixed: 'left', width: 200, onCell: () => ({ style: { fontSize: 18, fontWeight: 700 } }) },
    { title: <span style={colStyle}>Понеделник</span>, dataIndex: 'mon', key: 'mon', onCell: () => ({ style: colStyle }) },
    { title: <span style={colStyle}>Вторник</span>, dataIndex: 'tue', key: 'tue', onCell: () => ({ style: colStyle }) },
    { title: <span style={colStyle}>Сряда</span>, dataIndex: 'wed', key: 'wed', onCell: () => ({ style: colStyle }) },
    { title: <span style={colStyle}>Четвъртък</span>, dataIndex: 'thu', key: 'thu', onCell: () => ({ style: colStyle }) },
    { title: <span style={colStyle}>Петък</span>, dataIndex: 'fri', key: 'fri', onCell: () => ({ style: colStyle }) },
  ];

  return (
    <section style={{ padding: '60px 5%', background: '#fff', minHeight: '100vh' }}>
      <Button
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/')}
        style={{ marginBottom: 32, height: 44, fontSize: 16, paddingInline: 20 }}
      >
        Назад
      </Button>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Tag color="blue" style={{ fontSize: 15, padding: '4px 14px', marginBottom: 12 }}>График</Tag>
        <Title level={1}>График на тренировките</Title>
      </div>

      <Table
        dataSource={scheduleData}
        columns={columns}
        pagination={false}
        bordered
        scroll={{ x: 900 }}
        rowClassName={() => 'schedule-row'}
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 18 }}
        components={{
          body: {
            row: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
              <tr {...props} style={{ height: 72 }} />
            ),
          },
        }}
      />
    </section>
  );
};

export default ScheduleTable;
