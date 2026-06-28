import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid2 as Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCallback, useEffect, useState } from 'react';
import { dashboardApi, timeApi } from '../api/client';
import StatCard, { formatCurrency, formatDateTime, formatHours } from '../components/StatCard';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setError('');
    try {
      const { data } = await dashboardApi.get();
      setDashboard(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleClockIn = async () => {
    setActionLoading(true);
    setError('');
    try {
      await timeApi.clockIn(notes || null);
      setNotes('');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || 'Clock in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setError('');
    try {
      await timeApi.clockOut(notes || null);
      setNotes('');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || 'Clock out failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  const isClockedIn = !!dashboard?.active_entry;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Track your shifts, hours, and earnings at a glance.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                {isClockedIn ? 'You are clocked in' : 'Ready to clock in?'}
              </Typography>
              {isClockedIn && (
                <Typography variant="body2" color="text.secondary">
                  Started at {formatDateTime(dashboard.active_entry.clock_in)}
                </Typography>
              )}
            </Box>
            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              size="small"
              sx={{ minWidth: 240 }}
            />
            {isClockedIn ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleClockOut}
                disabled={actionLoading}
              >
                Clock Out
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PlayArrowIcon />}
                onClick={handleClockIn}
                disabled={actionLoading}
              >
                Clock In
              </Button>
            )}
            <Button startIcon={<RefreshIcon />} onClick={loadDashboard}>
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="This Week"
            value={formatHours(dashboard?.weekly_summary?.total_hours)}
            subtitle={`${dashboard?.weekly_summary?.entry_count ?? 0} entries`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Weekly Earnings"
            value={formatCurrency(dashboard?.weekly_summary?.total_earnings)}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="This Month"
            value={formatHours(dashboard?.monthly_summary?.total_hours)}
            subtitle={`${dashboard?.monthly_summary?.entry_count ?? 0} entries`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Monthly Earnings"
            value={formatCurrency(dashboard?.monthly_summary?.total_earnings)}
            color="secondary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: 360 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Daily Hours (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={dashboard?.daily_chart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [name === 'hours' ? formatHours(value) : formatCurrency(value), name]} />
                  <Legend />
                  <Bar dataKey="hours" fill="#1565c0" name="Hours" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: 360 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Weekly Earnings (Last 4 Weeks)
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={dashboard?.weekly_chart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="earnings" stroke="#00897b" strokeWidth={3} name="Earnings" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
