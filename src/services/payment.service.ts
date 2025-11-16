import https from 'https'
import crypto from 'crypto'

export type MomoPaymentParams = {
  partnerCode: string
  accessKey: string
  secretKey: string
  amount: string
  orderId: string
  orderInfo: string
  redirectUrl: string
  ipnUrl: string
  extraData?: string
  requestType?: string
}

export const createMomoPaymentQR = async (params: MomoPaymentParams) => {
  try {
    const {
      partnerCode,
      accessKey,
      secretKey,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData = '',
      requestType = 'captureWallet'
    } = params

    const requestId = `${partnerCode}${Date.now()}`

    // Build raw signature
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex')

    const requestBody = JSON.stringify({
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: 'en'
    })

    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }

    const response = await new Promise<any>((resolve, reject) => {
      const req = https.request(options, res => {
        let data = ''

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (err) {
            reject(err)
          }
        })
      })

      req.on('error', reject)
      req.write(requestBody)
      req.end()
    })

    return {
      message: 'Generated MoMo QR successfully',
      data: response
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
