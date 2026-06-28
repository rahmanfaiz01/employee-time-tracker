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
import SaveIcon from '@mui/icons-material/Save';
import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../components/StatCard';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setHourlyRate(String(user.hourly_rate ?? 0));
    }
  }, [user]);

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await dashboardApi.updateHourlyRate(Number(hourlyRate) || 0);
      await refreshUser();
      setSuccess('Hourly rate updated. Future earnings will use this rate.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update hourly rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3} maxWidth={560}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Settings
        </Typography>
        <Typography color="text.secondary">
          Configure your hourly pay rate for automatic earnings calculation.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user?.full_name} · {user?.email}
          </Typography>
          <Typography variant="body2" mb={3}>
            Current rate: {formatCurrency(user?.hourly_rate)}/hr
          </Typography>

          <Box component="form" onSubmit={handleSave}>
            <Stack spacing={2}>
              <TextField
                label="Hourly rate (USD)"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                fullWidth
                helperText="Earnings = hours worked × hourly rate"
              />
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save Rate'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
