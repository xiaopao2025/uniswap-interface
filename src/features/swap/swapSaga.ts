import { MethodParameters } from '@uniswap/v3-sdk'
import { providers } from 'ethers'
import { getWalletAccounts, getWalletProviders } from 'src/app/walletContext'
import { ApproveParams, maybeApprove } from 'src/features/approve/approveSaga'
import { AccountType } from 'src/features/wallet/accounts/types'
import { logger } from 'src/utils/logger'
import { isZero } from 'src/utils/number'
import { createMonitoredSaga } from 'src/utils/saga'
import { call } from 'typed-redux-saga'

export interface SwapParams extends ApproveParams {
  methodParameters: MethodParameters
}

export function* approveAndSwap(params: SwapParams) {
  const {
    account,
    chainId,
    methodParameters: { calldata, value },
    spender: swapRouter,
  } = params

  try {
    const accountManager = yield* call(getWalletAccounts)
    const providerManager = yield* call(getWalletProviders)
    const walletAccount = accountManager.getAccount(account.address)

    if (walletAccount.type === AccountType.readonly) throw new Error('Account must support signing')

    const provider = providerManager.getProvider(chainId)
    const signer = walletAccount.signer.connect(provider)

    const approved = yield* call(maybeApprove, params)
    if (!approved) {
      throw new Error('Provided SwapRouter contract is not approved to spend tokens')
    }

    const transaction: providers.TransactionRequest = {
      from: account.address,
      to: swapRouter,
      data: calldata,
      ...(!value || isZero(value) ? {} : { value }),
    }

    const tx = yield* call([signer, signer.populateTransaction], transaction)
    const signedTx = yield* call([signer, signer.signTransaction], tx)

    const transactionResponse = yield* call([provider, provider.sendTransaction], signedTx)

    logger.debug(
      'swapSaga',
      'approveAndSwap',
      'Transaction response hash:',
      transactionResponse.hash
    )

    const receipt = yield* call(transactionResponse.wait)
    logger.debug('swapSaga', '', 'Receipt:', receipt.transactionHash)
  } catch (e) {
    logger.error('swapSaga', 'approveAndSwap', 'Failed:', e)
    return false
  }
}

export const {
  name: swapSagaName,
  wrappedSaga: swapSaga,
  reducer: swapReducer,
  actions: swapActions,
} = createMonitoredSaga<SwapParams>(approveAndSwap, 'swap')
