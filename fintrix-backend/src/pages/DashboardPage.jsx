import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Container className="py-5">
        <h1 className="mb-4">Welcome back, {user?.name}!</h1>
        
        <Row className="g-4">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <h6>Total Balance</h6>
                <h3>${stats?.totalBalance?.toLocaleString()}</h3>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card income">
              <Card.Body>
                <h6>Income</h6>
                <h3>${stats?.income?.toLocaleString()}</h3>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card expense">
              <Card.Body>
                <h6>Expenses</h6>
                <h3>${stats?.expenses?.toLocaleString()}</h3>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="stat-card savings">
              <Card.Body>
                <h6>Savings Goal</h6>
                <h3>{stats?.savingsGoal}%</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col md={8}>
            <Card>
              <Card.Header>
                <h5>Recent Transactions</h5>
              </Card.Header>
              <Card.Body>
                {stats?.recentTransactions?.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <span>{transaction.description}</span>
                    <span className={transaction.type}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                    </span>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card>
              <Card.Header>
                <h5>Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <button className="btn-get-started w-100 mb-2">Add Income</button>
                <button className="btn-learn-more w-100">Add Expense</button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DashboardPage;