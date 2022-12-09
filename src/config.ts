import {
  ACTIVE_CHAINS,
  AMPLITUDE_API_URL,
  AMPLITUDE_EXPERIMENTS_DEPLOYMENT_KEY,
  DEBUG,
  INFURA_PROJECT_ID,
  LOG_BUFFER_SIZE,
  MOONPAY_API_KEY,
  MOONPAY_API_URL,
  MOONPAY_WIDGET_API_URL,
  ONESIGNAL_APP_ID,
  SENTRY_DSN,
  UNISWAP_API_BASE_URL,
  UNISWAP_API_KEY,
  UNISWAP_APP_URL,
  VERSION,
} from 'react-native-dotenv'
import { ChainIdTo } from 'src/constants/chains'
import { ChainState } from 'src/features/chains/types'
import { chainListToStateMap } from 'src/features/chains/utils'
import { parseActiveChains } from 'src/utils/chainId'

export interface Config {
  activeChains: ChainIdTo<ChainState>
  amplitudeExperimentsDeploymentKey: string
  amplitudeApiUrl: string
  debug: boolean
  moonpayApiKey: string
  moonpayApiUrl: string
  moonpayWidgetApiUrl: string
  uniswapApiBaseUrl: string
  uniswapApiKey: string
  uniswapAppUrl: string
  infuraProjectId: string
  logBufferSize: number
  onesignalAppId: string
  sentryDsn: string
  version: string
}

const _config: Config = {
  activeChains: chainListToStateMap(parseActiveChains(ACTIVE_CHAINS)),
  amplitudeApiUrl: AMPLITUDE_API_URL,
  amplitudeExperimentsDeploymentKey:
    process.env.AMPLITUDE_EXPERIMENTS_DEPLOYMENT_KEY || AMPLITUDE_EXPERIMENTS_DEPLOYMENT_KEY,
  debug: parseBoolean(DEBUG),
  moonpayApiKey: process.env.MOONPAY_API_KEY || MOONPAY_API_KEY,
  moonpayApiUrl: process.env.MOONPAY_API_URL || MOONPAY_API_URL,
  moonpayWidgetApiUrl: process.env.MOONPAY_WIDGET_API_URL || MOONPAY_WIDGET_API_URL,
  uniswapApiBaseUrl: process.env.UNISWAP_API_BASE_URL || UNISWAP_API_BASE_URL,
  uniswapApiKey: process.env.UNISWAP_API_KEY || UNISWAP_API_KEY,
  uniswapAppUrl: UNISWAP_APP_URL,
  infuraProjectId: process.env.INFURA_PROJECT_ID || INFURA_PROJECT_ID,
  logBufferSize: parseInt(LOG_BUFFER_SIZE, 10),
  onesignalAppId: process.env.ONESIGNAL_APP_ID || ONESIGNAL_APP_ID,
  sentryDsn: process.env.SENTRY_DSN || SENTRY_DSN,
  version: VERSION,
}

function parseBoolean(value: string): boolean {
  return value?.toLowerCase() === 'true'
}

export const config = Object.freeze(_config)

if (config.debug) {
  // Cannot use logger here, causes error from circular dep
  // eslint-disable-next-line no-console
  console.debug('Using app config:', config)
}
