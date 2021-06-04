const { xml2json } = require('xml-js');


const xmlSnippet = `
<Stream>
  <Incident et="72.4">Derek Warwick(90) reported contact (0.10) with Immovable</Incident>
  <Incident et="74.2">Chops(5) reported contact (0.03) with Immovable</Incident>
  <Score et="1596.6">Ukyo Katayama(85) lap=12 point=2 t=97.130 et=1596.547</Score>
  <Score et="1598.4">Chops(5) lap=13 point=1 t=47.108 et=1598.257</Score>
  <Score et="1607.3">Ayrton Senna(82) lap=13 point=1 t=39.390 et=1607.314</Score>
</Stream>
`

const driverNameDelimiter = /\(\d*\)\s/

const { elements: [stream] } = JSON.parse(xml2json(xmlSnippet))

/**
 * @example
 * > "lap=13 point=1 t=47.108 et=1598.257"
 * < {lap: 13, point: 1, ...}
 *
 * @param {*} plainText
 */
const convertScoreToObject = plainText => {
  const timingPairs = plainText?.split(' ')?.map(pair => {
    let [key, value] = pair.split('=')

    return [key, parseFloat(value, 10)]
  })

  return Object.fromEntries(timingPairs)
}

const isScore = streamElement => {
  return streamElement?.name?.toLocaleLowerCase() === 'score'
}

/**
 * convert `<Score et="1607.3">Ayrton Senna(82) lap=13 point=1 t=39.390 et=1607.314</Score>`
 *
 * into
 * {
 *   name: 'Ayrton Senna',
 *   et: 1607.3,
 *   lap: 13,
 *   sector: 1
 * }
 */
const parsedStream = stream?.elements
  ?.filter(isScore)
  ?.map(score => {
    const [{ text }] = score.elements
    const [driverName, plainTextValues] = text.split(driverNameDelimiter)
    const { lap, point: sector } = convertScoreToObject(plainTextValues)

    return {
      driverName,
      et: parseFloat(score.attributes.et, 10),
      lap,
      sector
    }
  })

console.info({ parsedStream })
