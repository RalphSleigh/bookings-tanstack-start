import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Button,
  Flex,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core'
import { IconBug, IconLogout, IconMoon, IconSun } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext, useSearch } from '@tanstack/react-router'
import React, { useContext } from 'react'
import cx from 'clsx'

/* import { envQueryOptions } from '../queries/env' */
import { CustomLink } from '../utils/customlink'
import classes from '../css/darkmodeIcon.module.css'
import { userQueryOptions } from '@/queries/user'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper';

export const AppToolbar = () => {
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  })
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }
  //const { data: env } = useSuspenseQuery(envQueryOptions)
  const [error, setError] = React.useState(false)

  if (error) throw 'BOOM (render)'

  return (
    <AppShell.Header>
      <Flex
        gap="xs"
        justify="flex-start"
        align="center"
        direction="row"
        wrap="wrap"
        mr={8}
      >
        <Box>
          <CustomLink underline="hover" to="/">
            <img
              src="/logoonly.png"
              alt="Logo"
              style={{ display: 'block', height: '3em' }}
            />
          </CustomLink>
        </Box>

        <CustomLink underline="hover" to="/">
          <Text c="var(--mantine-color-text)" size="xl" fw={700}>
            TEST
          </Text>
        </CustomLink>
        <Box component="div" flex={1} />

        <UserStatus />
        <ActionIcon
          variant="default"
          size="input-sm"
          aria-label="Settings"
          onClick={toggleColorScheme}
        >
          <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
          <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
        </ActionIcon>

        {/*  {env.env === 'dev' ? (
          <>
            <ActionIcon
              variant="default"
              size="input-sm"
              onClick={() => {
                throw 'BOOM (event handler)'
              }}
              c="orange"
            >
              <IconBug />
            </ActionIcon>
            <ActionIcon
              variant="default"
              size="input-sm"
              onClick={() => {
                setError(true)
              }}
              c="orange"
            >
              <IconBug />
            </ActionIcon>
            <Title order={6} c="orange" pr={16}>
              TEST MODE
            </Title>
          </>
        ) : null} */}
      </Flex>
    </AppShell.Header>
  )
}

const UserStatus = () => {
  //const { auth } = useRouteContext({ from: '__root__' })
  const query = useSearch({ from: '__root__' })
  const user = useSuspenseQuery(userQueryOptions).data
  if (user) {
    return (
      <>
        <CustomLink underline="hover" to="/user">
          <Text>{user.name?.replaceAll(' ', '\xa0') ?? ''}</Text>
        </CustomLink>
        <CustomLink to="/user" style={{ textDecoration: 'none' }}>
          <Avatar
            imageProps={{
              referrerPolicy: 'no-referrer',
            }}
            name={user?.name ?? undefined}
            src={user.avatar}
            size={32}
          />
        </CustomLink>
        <ActionIcon component={'a'} href="/api/user/logout" variant="default" size="input-sm">
          <IconLogout />
        </ActionIcon>
      </>
    )
  } else {
    return (
      <Button component="a" variant="default" href={query.redirect ? `/auth/redirect?redirect=${query.redirect}` : '/auth/redirect'}>
        Login
      </Button>
    )
  }
}

