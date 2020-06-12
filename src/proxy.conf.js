const PROXY_CONFIG = [
  {
    context: [
      "/ipredictapi",
      "/SolarSightWS"
    ],
    target: "https://app.ipredict.io/",
    secure: false
  }
];

module.exports = PROXY_CONFIG;
