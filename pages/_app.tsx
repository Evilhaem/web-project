import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'

function MyApp({ Component, pageProps }: AppProps) {
    return <MantineProvider withGlobalStyles 
        theme={{
        colorScheme: 'dark',
        }}
        >
        <Component {...pageProps} />
        </MantineProvider>
    }

export default MyApp
