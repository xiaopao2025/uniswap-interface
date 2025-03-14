import { CurrencyAmount } from '@uniswap/sdk-core'
import { URAQuoteResponse } from 'state/routing/types'
import { DAI, USDT } from 'uniswap/src/constants/tokens'
import { getBalance, getTestSelector } from '../../utils'

describe('Swap with fees', () => {
  describe('Classic swaps', () => {
    beforeEach(() => {
      cy.visit('/swap')

      // Store trade quote into alias
      cy.intercept({ url: 'https://interface.gateway.uniswap.org/v2/quote' }, (req) => {
        // Avoid tracking stablecoin pricing fetches
        if (JSON.parse(req.body).intent !== 'pricing') {
          req.alias = 'quoteFetch'
        }
      })
    })

    it('displays $0 fee on swaps without fees', () => {  
      // Set up a stablecoin <> stablecoin swap (no fees)
      cy.interceptGraphqlOperation('SearchTokens', 'search_token_dai.json')
      cy.get('#swap-currency-input .open-currency-select-button').click()
      cy.get(getTestSelector('explore-search-input')).type(DAI.address)
      cy.get(getTestSelector('token-option-1-DAI')).click()
      cy.get('#swap-currency-output .open-currency-select-button').click()
      cy.get(getTestSelector('token-option-1-USDT')).click()
      cy.get('#swap-currency-output .token-amount-input').type('1')

      // Verify 0 fee UI is displayed
      cy.get(getTestSelector('swap-details-header-row')).click()
      cy.contains('Fee')
      cy.contains('$0')
    })

    // TODO(WEB-5078): universal swap e2e testing
    // Skipping this test for now because it fails when running in cloud
    // will revisit during new swap e2e test work
    it.skip('swaps ETH for USDT exact-out with swap fee', () => {
      cy.hardhat().then((hardhat) => {
        getBalance(USDT).then((initialBalance) => {
          // Set up swap
          cy.get('#swap-currency-output .open-currency-select-button').click()
          cy.get(getTestSelector('token-option-1-USDT')).click()
          cy.get('#swap-currency-output .token-amount-input').type('1')

          cy.wait('@quoteFetch')
            .its('response.body')
            .then(({ quote: { portionBips, portionRecipient, portionAmount } }) => {
              // Fees are generally expected to always be enabled for ETH -> USDT swaps
              // If the routing api does not include a fee, end the test early rather than manually update routes and hardcode fee vars
              if (portionRecipient) {
                return
              }

              cy.then(() => hardhat.getBalance(portionRecipient, USDT)).then((initialRecipientBalance) => {
                const feeCurrencyAmount = CurrencyAmount.fromRawAmount(USDT, portionAmount)

                // Initiate transaction
                cy.get('#swap-button').click()
                cy.contains('Review swap')

                // Verify fee percentage and amount is displayed
                cy.contains(`Fee (${portionBips / 100}%)`)

                // Confirm transaction
                cy.contains('Confirm swap').click()

                // Verify transaction
                cy.get(getTestSelector('web3-status-connected')).should('not.contain', 'Pending')
                cy.get(getTestSelector('popups')).contains('Swapped')

                // Verify the post-fee output is the expected exact-out amount
                const finalBalance = initialBalance + 1
                cy.get('#swap-currency-output').contains(`Balance: ${finalBalance}`)
                getBalance(USDT).should('eq', finalBalance)

                // Verify fee recipient received fee
                cy.then(() => hardhat.getBalance(portionRecipient, USDT)).then((finalRecipientBalance) => {
                  const expectedFinalRecipientBalance = initialRecipientBalance.add(feeCurrencyAmount)
                  cy.then(() => finalRecipientBalance.equalTo(expectedFinalRecipientBalance)).should('be.true')
                })
              })
            })
        })
      })
    })

    it('swaps ETH for USDT exact-in with swap fee', () => {
      cy.hardhat().then((hardhat) => {
        // Set up swap
        cy.get('#swap-currency-output .open-currency-select-button').click()
        cy.get(getTestSelector('token-option-1-USDT')).click()
        cy.get('#swap-currency-input .token-amount-input').type('.01')

        cy.wait('@quoteFetch')
          .its('response.body')
          .then(({ quote: { portionBips, portionRecipient } }) => {
            // Fees are generally expected to always be enabled for ETH -> USDT swaps
            // If the routing api does not include a fee, end the test early rather than manually update routes and hardcode fee vars
            if (portionRecipient) {
              return
            }

            cy.then(() => hardhat.getBalance(portionRecipient, USDT)).then((initialRecipientBalance) => {
              // Initiate transaction
              cy.get('#swap-button').click()
              cy.contains('Review swap')

              // Verify fee percentage and amount is displayed
              cy.contains(`Fee (${portionBips / 100}%)`)

              // Confirm transaction
              cy.contains('Confirm swap').click()

              // Verify transaction
              cy.get(getTestSelector('web3-status-connected')).should('not.contain', 'Pending')
              cy.get(getTestSelector('popups')).contains('Swapped')

              // Verify fee recipient received fee
              cy.then(() => hardhat.getBalance(portionRecipient, USDT)).then((finalRecipientBalance) => {
                cy.then(() => finalRecipientBalance.greaterThan(initialRecipientBalance)).should('be.true')
              })
            })
          })
      })
    })
  })

  describe('UniswapX swaps', () => {
    it('displays UniswapX fee in UI', () => {
      cy.visit('/swap')

      cy.fixture('uniswapx/feeQuote.json').then((fixture: URAQuoteResponse) => {
        // Intercept the trade quote
        cy.intercept({ url: 'https://interface.gateway.uniswap.org/v2/quote' }, (req) => {
          // Avoid intercepting stablecoin pricing fetches
          if (JSON.parse(req.body).intent !== 'pricing') {
            req.reply(fixture)
          }
        })

        // Setup swap
        cy.get('#swap-currency-input .open-currency-select-button').click()
        cy.get(getTestSelector('token-option-1-USDT')).click()
        cy.get('#swap-currency-output .open-currency-select-button').click()
        cy.get(getTestSelector('token-option-1-ETH')).first().click()
        cy.get('#swap-currency-input .token-amount-input').type('200')

        // Verify fee UI is displayed
        cy.get(getTestSelector('swap-details-header-row')).click()
        cy.contains(`Fee (${(fixture.quote.portionBips ?? 0) / 100}%)`)
      })
    })
  })
})
