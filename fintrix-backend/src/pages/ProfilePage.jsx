import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'danger', text: result.error || 'Update failed' });
    }
    
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <Container className="py-5">
        <Row>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <div className="avatar-wrapper mb-3">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt={user?.name} className="avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <h4>{user?.name}</h4>
                <p className="text-muted">{user?.email}</p>
                <p className="text-muted small">
                  Provider: {user?.provider}
                  {user?.isVerified ? ' ✓' : ' (Not verified)'}
                </p>
                <Button variant="outline-danger" onClick={logout}>
                  Logout
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card>
              <Card.Header>
                <h5>Edit Profile</h5>
              </Card.Header>
              <Card.Body>
                {message.text && (
                  <Alert variant={message.type}>{message.text}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={user?.provider === 'google'}
                    />
                    {user?.provider === 'google' && (
                      <Form.Text className="text-muted">
                        Email cannot be changed for Google accounts
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Avatar URL</Form.Label>
                    <Form.Control
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <Form.Text className="text-muted">
                      Enter a URL for your profile picture
                    </Form.Text>
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="btn-get-started"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {user?.provider === 'local' && (
              <Card className="mt-4">
                <Card.Header>
                  <h5>Security Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Button variant="outline-primary" className="me-2">
                    Change Password
                  </Button>
                  <Button variant="outline-secondary">
                    Enable 2FA
                  </Button>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProfilePage;