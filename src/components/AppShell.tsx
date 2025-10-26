import { AppShell, Box, Text } from '@mantine/core'
import { Outlet } from '@tanstack/react-router'

import classes from '../css/mainArea.module.css'
import { AppToolbar } from './AppToolBar'
import dayjs from 'dayjs'

export const Shell = () => {
  return (
    <AppShell header={{ height: 48 }}>
      <AppToolbar />
      <AppShell.Main className={classes.root}>
        <Box
          style={{
            minHeight: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box flex={1}>
            <Outlet />
          </Box>
          <Box>
            <Text size="xs" ta="center" c="dimmed" mt={16} mb={8}>
              &copy; {new Date().getFullYear()} Woodcraft Folk. Source on{' '}
              <a href="https://github.com/RalphSleigh/bookings-serverless-nosql-v2">
                GitHub
              </a>
              . - Built {dayjs(BUILD_DATE).format('MMMM D, YYYY HH:mm')} -{' '}
              <a href="/api/auth/redirect?switch=true">Switch User</a>.
            </Text>
          </Box>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
