const consola = require('consola')
const fse = require('fs-extra')
const yargs = require('yargs')

const { xml2json } = require('xml-js')

// awk deconstruct but tasks takes one arg
const { _: [resultFileNameToProcess] } = yargs.argv


/**
 * Takes a race XML and parse it into JSON structure we're expecting
 *
 * usage `npm run parse:race -- demo-dump.xml`
 *
 *
 */
fse.readFile(`./raw-results/${resultFileNameToProcess}`, async (err, data) => {
  if (data) {
    const { createdFileName, parsedStream } = getCorePropsFromXML(data)

    await fse
      .outputFile(`./assets/results/${createdFileName}`,
        JSON.stringify(parsedStream)
      )
      .then(() => consola.log('saved results:', createdFileName))
      .catch((error) => consola.error('results failed', error))
  }
});

/**
 * xml is nasty, find Race.Stream, there is some header stuff not needed here
 *
 * @param {*} data XML response from arg file
 * @returns
 */
const getCorePropsFromXML = data => {
  // there is meta stuff (event date, track, cars...) in `raceResults`, could be handy?
  const { elements: [_, { elements: [{ elements: raceResults }] }] } = JSON.parse(xml2json(data))

  const { elements: race } = raceResults.find(key => key.name === 'Race')
  const { elements: stream } = race.find(key => key.name === 'Stream')

  const parsedStream = parseScoresFromStream(stream)

  const { TimeString, TrackCourse } = Object.fromEntries(
    raceResults.map(resultKey => {
      try {
        const { name, elements: [{ text }] } = resultKey

        return [name, text]
      } catch {
        return [,]
      }
    }))

  // needs some adjusting for urls
  const simpleDate = TimeString.split(/\s/)[0].replace(/\//g, '-')
  const simpleTrack = TrackCourse.replace(/\s/g, '-').toLowerCase()

  // data structure?
  // how to do different classes. what if we do a season?
  // `/:event[race, qual]/:date/:name.json`

  return {
    createdFileName: `/race/${simpleDate}/${simpleTrack}.json`,
    parsedStream,
  }
}

const driverNameDelimiter = /\(\d*\)\s/
const sectorTimingScorePattern = /lap=.*point=/


/**
 * Converts each score in stream into object to send to timing screen
 *
 * @param {Array} stream
 * @returns
 */
const parseScoresFromStream = stream => {
  const parsed = stream
    ?.filter(isSectorUpdate)
    ?.map(({ elements, attributes }) => {
      const [{ text }] = elements
      const [driverName, plainTextValues] = text.split(driverNameDelimiter)

      const { lap, point: sector } = convertScoreToObject(plainTextValues)

      return {
        driverName,
        et: parseFloat(attributes.et, 10),
        lap,
        sector
      }
    })

  return parsed
}

/**
 * lots of junk in stream, only want scores with sector info
 *
 * @param {*} streamElement
 * @returns Boolean
 */
const isSectorUpdate = streamElement => {
  if (streamElement.name !== 'Score') {
    return
  }

  const [{ text }] = streamElement.elements

  return !!text.match(sectorTimingScorePattern)
}


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
