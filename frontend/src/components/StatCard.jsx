import { Card, CardContent, Stack, Typography } from '@mui/material';

export default function StatCard({ title, value, subtitle, color = 'primary.main' }) {
  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} color={color}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount ?? 0);
}

export function formatHours(hours) {
  return `${(hours ?? 0).toFixed(2)} hrs`;
}

export function formatDateTime(value) {
  if (!value) return '—';
  const normalized = typeof value === 'string' && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)
    ? `${value}Z`
    : value;
  return new Date(normalized).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
