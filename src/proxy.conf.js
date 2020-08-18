const PROXY_CONFIG = [
  {
    context: [
      "/ipredictapi1",
      "/SolarSightWS1"
    ],
    target: "https://app.ipredict.io/",
    secure: false
  }
];

module.exports = PROXY_CONFIG;
