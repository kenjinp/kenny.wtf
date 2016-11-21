import axios from 'axios'

export default class {
  constructor () {
    this.apiKey = 'A47pk7JeYG9xycovBbE4n5sZica7jjTb33WbaLr1'
    this.uri = 'https://ywl9jh34y4.execute-api.eu-central-1.amazonaws.com/prod'
  }

  fetchFingerprints () {
    return axios.request({
      url: this.uri,
      params: {
        TableName: 'fingerprint'
      },
      headers: {
        'x-api-key': this.apiKey
      }
    })
  }

  get allFingerprints () {
    console.log('hello people')
    return this.fetchFingerprints()
  }

  // get fingerprint () {
  //   return (async () => {
  //     return await fetchFingerprints();
  //   })();
  // }

  set fingerprint (fingerprint) {

  }
}
