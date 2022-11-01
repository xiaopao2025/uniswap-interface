import { combineReducers } from '@reduxjs/toolkit'
import { monitoredSagaReducers } from 'src/app/rootSaga'
import { biometricSettingsReducer } from 'src/features/biometrics/slice'
import { blocksReducer } from 'src/features/blocks/blocksSlice'
import { chainsReducer } from 'src/features/chains/chainsSlice'
import { cloudBackupReducer } from 'src/features/CloudBackup/cloudBackupSlice'
import { passwordLockoutReducer } from 'src/features/CloudBackup/passwordLockoutSlice'
import { ensApi } from 'src/features/ens/api'
import { experimentsReducer } from 'src/features/experiments/slice'
import { searchHistoryReducer } from 'src/features/explore/searchHistorySlice'
import { favoritesReducer } from 'src/features/favorites/slice'
import { forceUpgradeApi } from 'src/features/forceUpgrade/forceUpgradeApi'
import { gasApi } from 'src/features/gas/api'
import { modalsReducer } from 'src/features/modals/modalSlice'
import { multicall } from 'src/features/multicall'
import { notificationReducer } from 'src/features/notifications/notificationSlice'
import { providersReducer } from 'src/features/providers/providerSlice'
import { routingApi } from 'src/features/routing/routingApi'
import { tokenListsReducer } from 'src/features/tokenLists/reducer'
import { tokensReducer } from 'src/features/tokens/tokensSlice'
import { transactionReducer } from 'src/features/transactions/slice'
import { trmApi } from 'src/features/trm/api'
import { walletReducer } from 'src/features/wallet/walletSlice'
import { walletConnectReducer } from 'src/features/walletConnect/walletConnectSlice'
export const rootReducer = combineReducers({
  [ensApi.reducerPath]: ensApi.reducer,
  [forceUpgradeApi.reducerPath]: forceUpgradeApi.reducer,
  [gasApi.reducerPath]: gasApi.reducer,
  [multicall.reducerPath]: multicall.reducer,
  [routingApi.reducerPath]: routingApi.reducer,
  [trmApi.reducerPath]: trmApi.reducer,
  biometricSettings: biometricSettingsReducer,
  blocks: blocksReducer,
  chains: chainsReducer,
  favorites: favoritesReducer,
  modals: modalsReducer,
  notifications: notificationReducer,
  passwordLockout: passwordLockoutReducer,
  providers: providersReducer,
  saga: monitoredSagaReducers,
  searchHistory: searchHistoryReducer,
  tokenLists: tokenListsReducer,
  tokens: tokensReducer,
  transactions: transactionReducer,
  wallet: walletReducer,
  walletConnect: walletConnectReducer,
  cloudBackup: cloudBackupReducer,
  experiments: experimentsReducer,
})

export type RootState = ReturnType<typeof rootReducer>
