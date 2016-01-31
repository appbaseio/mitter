var appbaseRef = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: 'meteor-twitter',
  username: 'LPQQpGHXV',
  password: '48006b64-2785-451b-bea0-070227dca401'
});
if (Meteor.isClient) {
  var renderedTweets = new ReactiveArray();
  var requestObject = {
    type: 'tweets',
    size: 20,
    body: {
      query: {
        match: {
          tweet: {
            query: "",
            operator: "or",
            zero_terms_query: "all"
          }
        }
      }
    }
  }
  appbaseRef.search(requestObject).on('data', function(result) {
      result.hits.hits.map(function(object){
        renderedTweets.unshift(object._source)
      })
      appbaseRef.searchStream(requestObject).on('data', function(stream) {
        renderedTweets.unshift(stream._source)
      }).on('error', function(stream) {
        console.log("query error: ", stream)
      })
  })

  // This code only runs on the client
  Template.body.helpers({
    tweets: function () {
      return renderedTweets.list();
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
