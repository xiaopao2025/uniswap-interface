import { BigNumber } from '@ethersproject/bignumber'
import { formatEther as ethersFormatEther } from '@ethersproject/units'
import clsx from 'clsx'
import { ButtonEmphasis, ButtonSize, ThemeButton } from 'components/Button'
import { Box } from 'nft/components/Box'
import { Column, Row } from 'nft/components/Flex'
import * as styles from 'nft/components/bag/BagRow.css'
import { TimedLoader } from 'nft/components/bag/TimedLoader'
import { Suspicious } from 'nft/components/card/icons'
import {
  ChevronDownBagIcon,
  ChevronUpBagIcon,
  CircularCloseIcon,
  CloseTimerIcon,
  SquareArrowDownIcon,
  SquareArrowUpIcon,
  VerifiedIcon,
} from 'nft/components/icons'
import { bodySmall } from 'nft/css/common.css'
import { loadingBlock } from 'nft/css/loading.css'
import { GenieAsset, UpdatedGenieAsset } from 'nft/types'
import { getAssetHref } from 'nft/utils'
import { MouseEvent, useCallback, useEffect, useReducer, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { NumberType, useFormatter } from 'utils/formatNumbers'

export const RemoveButton = styled(ThemeButton)`
  border-radius: 12px;
  font-size: 14px;
  line-height: 16px;
  margin-left: 16px;
  padding: 12px 14px;
`
const ReviewButton = styled(ThemeButton)`
  border-radius: 12px;
  flex: 1 1 auto;
  font-size: 14px;
  padding: 8px;
  width: 50%;
`
const RemoveAssetOverlay = styled.div`
  position: absolute;
  display: block;
  right: -11px;
  top: -11px;
  z-index: 1;
  transition: 250ms;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const RemoveAssetButton = ({ onClick }: { onClick: (e: MouseEvent<HTMLDivElement>) => void }) => (
  <RemoveAssetOverlay onClick={onClick}>
    <CircularCloseIcon />
  </RemoveAssetOverlay>
)

const NoContentContainer = () => (
  <Box position="relative" background="loadingBackground" className={styles.bagRowImage}>
    <Box
      position="absolute"
      textAlign="center"
      left="1/2"
      top="1/2"
      style={{ transform: 'translate3d(-50%, -50%, 0)' }}
      color="gray500"
      fontSize="12"
      fontWeight="book"
    >
      Image
      <br />
      not
      <br />
      available
    </Box>
  </Box>
)

interface BagRowProps {
  asset: UpdatedGenieAsset
  usdPrice?: number
  removeAsset: (assets: GenieAsset[]) => void
  showRemove?: boolean
  grayscale?: boolean
  isMobile: boolean
}

export const BagRow = ({ asset, usdPrice, removeAsset, showRemove, grayscale, isMobile }: BagRowProps) => {
  const { formatEther, formatNumberOrString } = useFormatter()
  const [loadedImage, setImageLoaded] = useState(false)
  const [noImageAvailable, setNoImageAvailable] = useState(!asset.smallImageUrl)

  const [cardHovered, setCardHovered] = useState(false)
  const handleMouseEnter = useCallback(() => setCardHovered(true), [])
  const handleMouseLeave = useCallback(() => setCardHovered(false), [])
  const showRemoveButton = Boolean(showRemove && cardHovered && !isMobile)

  const assetEthPrice = asset.updatedPriceInfo ? asset.updatedPriceInfo.ETHPrice : asset.priceInfo.ETHPrice
  const assetEthPriceFormatted = formatEther({ input: assetEthPrice, type: NumberType.NFTToken })
  const assetUSDPriceFormatted = formatNumberOrString({
    input: usdPrice ? parseFloat(ethersFormatEther(assetEthPrice)) * usdPrice : usdPrice,
    type: NumberType.FiatNFTToken,
  })

  const handleRemoveClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      removeAsset([asset])
    },
    [asset, removeAsset],
  )

  return (
    <Link to={getAssetHref(asset)} style={{ textDecoration: 'none' }}>
      <Row className={styles.bagRow} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Box position="relative" display="flex">
          {showRemove && isMobile && <RemoveAssetButton onClick={handleRemoveClick} />}
          {!noImageAvailable && (
            <Box
              as="img"
              src={asset.smallImageUrl}
              alt={asset.name}
              className={clsx(styles.bagRowImage, grayscale && !cardHovered && styles.grayscaleImage)}
              onLoad={() => {
                setImageLoaded(true)
              }}
              onError={() => {
                setNoImageAvailable(true)
              }}
              visibility={loadedImage ? 'visible' : 'hidden'}
            />
          )}
          {!loadedImage && <Box position="absolute" className={`${styles.bagRowImage} ${loadingBlock}`} />}
          {noImageAvailable && <NoContentContainer />}
        </Box>
        <Column overflow="hidden" width="full" color={grayscale ? 'neutral2' : 'neutral1'}>
          <Row overflow="hidden" width="full" whiteSpace="nowrap">
            <Box className={styles.assetName}>{asset.name ?? `#${asset.tokenId}`}</Box>
            {asset.susFlag && <Suspicious />}
          </Row>
          <Row overflow="hidden" whiteSpace="nowrap" gap="2">
            <Box className={styles.collectionName}>{asset.collectionName}</Box>
            {asset.collectionIsVerified && <VerifiedIcon className={styles.icon} />}
          </Row>
        </Column>
        {showRemoveButton && (
          <RemoveButton onClick={handleRemoveClick} emphasis={ButtonEmphasis.medium} size={ButtonSize.medium}>
            Remove
          </RemoveButton>
        )}
        {(!showRemoveButton || isMobile) && (
          <Column flexShrink="0" alignItems="flex-end">
            <Box className={styles.bagRowPrice}>
              {assetEthPriceFormatted}
              &nbsp;ETH
            </Box>
            <Box className={styles.collectionName}>{assetUSDPriceFormatted}</Box>
          </Column>
        )}
      </Row>
    </Link>
  )
}

interface PriceChangeBagRowProps {
  asset: UpdatedGenieAsset
  usdPrice?: number
  markAssetAsReviewed: (asset: UpdatedGenieAsset, toKeep: boolean) => void
  top?: boolean
  isMobile: boolean
}

export const PriceChangeBagRow = ({ asset, usdPrice, markAssetAsReviewed, top, isMobile }: PriceChangeBagRowProps) => {
  const { formatEther } = useFormatter()
  const isPriceIncrease = BigNumber.from(asset.updatedPriceInfo?.ETHPrice).gt(BigNumber.from(asset.priceInfo.ETHPrice))
  const handleRemove = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const toKeep = false
      markAssetAsReviewed(asset, toKeep)
    },
    [asset, markAssetAsReviewed],
  )
  const handleKeep = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const toKeep = true
      markAssetAsReviewed(asset, toKeep)
    },
    [asset, markAssetAsReviewed],
  )
  return (
    <Column className={styles.priceChangeColumn} borderTopColor={top ? 'surface3' : 'transparent'}>
      <Row className={styles.priceChangeRow}>
        {isPriceIncrease ? <SquareArrowUpIcon /> : <SquareArrowDownIcon />}
        <Box>{`Price ${isPriceIncrease ? 'increased' : 'decreased'} from ${formatEther({
          input: asset.priceInfo.ETHPrice,
          type: NumberType.NFTToken,
        })} ETH`}</Box>
      </Row>
      <Box style={{ marginLeft: '-8px', marginRight: '-8px' }}>
        <BagRow asset={asset} usdPrice={usdPrice} removeAsset={() => undefined} isMobile={isMobile} />
      </Box>
      <Row gap="8" justifyContent="space-between">
        <ReviewButton onClick={handleRemove} emphasis={ButtonEmphasis.medium} size={ButtonSize.small}>
          Remove
        </ReviewButton>
        <ReviewButton onClick={handleKeep} emphasis={ButtonEmphasis.high} size={ButtonSize.small}>
          Keep
        </ReviewButton>
      </Row>
    </Column>
  )
}

interface UnavailableAssetsHeaderRowProps {
  assets?: UpdatedGenieAsset[]
  usdPrice?: number
  clearUnavailableAssets: () => void
  didOpenUnavailableAssets: boolean
  setDidOpenUnavailableAssets: (didOpen: boolean) => void
  isMobile: boolean
}

interface UnavailableAssetsPreviewProps {
  assets: UpdatedGenieAsset[]
}

const ASSET_PREVIEW_WIDTH = 32
const ASSET_PREVIEW_OFFSET = 20

const UnavailableAssetsPreview = ({ assets }: UnavailableAssetsPreviewProps) => (
  <Column
    display="grid"
    style={{
      gridTemplateColumns: `repeat(${assets.length}, 20px)`,
      width: `${ASSET_PREVIEW_WIDTH + (assets.length - 1) * ASSET_PREVIEW_OFFSET}px`,
    }}
  >
    {assets.map((asset, index) => (
      <Box
        key={`${asset.address}-${asset.tokenId}`}
        as="img"
        src={asset.smallImageUrl}
        width="32"
        height="32"
        borderStyle="solid"
        borderWidth="1px"
        borderColor="surface1"
        borderRadius="4"
        style={{ zIndex: index }}
        className={styles.grayscaleImage}
      />
    ))}
  </Column>
)

export const UnavailableAssetsHeaderRow = ({
  assets,
  usdPrice,
  clearUnavailableAssets,
  didOpenUnavailableAssets,
  setDidOpenUnavailableAssets,
  isMobile,
}: UnavailableAssetsHeaderRowProps) => {
  const [isOpen, toggleOpen] = useReducer((s) => !s, false)
  const timerLimit = 8
  const [timeLeft, setTimeLeft] = useState(timerLimit)

  useEffect(() => {
    if (!timeLeft) {
      if (!didOpenUnavailableAssets) {
        clearUnavailableAssets()
        setDidOpenUnavailableAssets(false)
      }
      return
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timeLeft, clearUnavailableAssets, didOpenUnavailableAssets, setDidOpenUnavailableAssets])

  if (!assets || assets.length === 0) {
    return null
  }

  const moreThanOneUnavailable = assets.length > 1
  const isShowingAssets = isOpen || !moreThanOneUnavailable

  return (
    <Column className={styles.unavailableAssetsContainer}>
      <Column>
        <Row
          justifyContent="space-between"
          marginBottom={isShowingAssets ? '12' : '0'}
          cursor={moreThanOneUnavailable ? 'pointer' : 'default'}
          onClick={() => {
            if (moreThanOneUnavailable) {
              !didOpenUnavailableAssets && setDidOpenUnavailableAssets(true)
              toggleOpen()
            }
          }}
        >
          <Row gap="12" color="neutral2" className={bodySmall}>
            {!isShowingAssets && <UnavailableAssetsPreview assets={assets.slice(0, 5)} />}
            No longer available
          </Row>
          {moreThanOneUnavailable && (
            <Row color="neutral2">{isOpen ? <ChevronUpBagIcon /> : <ChevronDownBagIcon />}</Row>
          )}
          {!didOpenUnavailableAssets && (
            <Row
              position="relative"
              width="20"
              height="20"
              color="neutral1"
              justifyContent="center"
              cursor="pointer"
              onClick={clearUnavailableAssets}
            >
              <TimedLoader />
              <CloseTimerIcon />
            </Row>
          )}
        </Row>
        <Column gap="8" style={{ marginLeft: '-8px', marginRight: '-8px' }}>
          {isShowingAssets &&
            assets.map((asset) => (
              <BagRow
                key={asset.id}
                asset={asset}
                usdPrice={usdPrice}
                removeAsset={() => undefined}
                grayscale
                isMobile={isMobile}
              />
            ))}
        </Column>
      </Column>
    </Column>
  )
}
