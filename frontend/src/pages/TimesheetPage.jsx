import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { timeApi } from '../api/client';
import { formatCurrency, formatDateTime, formatHours } from '../components/StatCard';

export default function TimesheetPage() {
  const [entries, setEntries] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const [entriesRes, weeklyRes, monthlyRes] = await Promise.all([
          timeApi.list({ limit: 100 }),
          timeApi.weeklySummary(),
          timeApi.monthlySummary(),
        ]);
        setEntries(entriesRes.data);
        setWeekly(weeklyRes.data);
        setMonthly(monthlyRes.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load timesheet');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Timesheet History
        </Typography>
        <Typography color="text.secondary">
          Review completed shifts and running totals.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Weekly Summary
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {formatHours(weekly?.total_hours)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(weekly?.total_earnings)} · {weekly?.entry_count} entries
            </Typography>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', flex: 1 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Monthly Summary
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {formatHours(monthly?.total_hours)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(monthly?.total_earnings)} · {monthly?.entry_count} entries
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No time entries yet.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>{formatDateTime(entry.clock_in)}</TableCell>
                    <TableCell>{formatDateTime(entry.clock_out)}</TableCell>
                    <TableCell>
                      {entry.duration_hours != null ? formatHours(entry.duration_hours) : 'In progress'}
                    </TableCell>
                    <TableCell>
                      {entry.earnings != null ? formatCurrency(entry.earnings) : '—'}
                    </TableCell>
                    <TableCell>
                      {entry.clock_out ? (
                        <Chip label="Completed" color="success" size="small" />
                      ) : (
                        <Chip label="Active" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{entry.notes || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}
