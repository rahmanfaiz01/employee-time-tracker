import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    hourly_rate: '25',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        ...form,
        hourly_rate: Number(form.hourly_rate) || 0,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" px={2}>
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Set up your profile and hourly pay rate.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField label="Full name" value={form.full_name} onChange={handleChange('full_name')} required fullWidth />
              <TextField label="Email" type="email" value={form.email} onChange={handleChange('email')} required fullWidth />
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                required
                fullWidth
                helperText="Minimum 6 characters"
              />
              <TextField
                label="Hourly rate (USD)"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={form.hourly_rate}
                onChange={handleChange('hourly_rate')}
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={<PersonAddIcon />}>
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" mt={3} textAlign="center">
            Already have an account?{' '}
            <RouterLink to="/login" style={{ color: '#1565c0', textDecoration: 'none' }}>
              Sign in
            </RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
