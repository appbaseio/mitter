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

    var conf = JSON.parse(Assets.getText('twitter.json'));

    var Twit = new TwitMaker({
      consumer_key: conf.consumer.key,
      consumer_secret: conf.consumer.secret,
      access_token: conf.access_token.key,
      access_token_secret: conf.access_token.secret
    });

    // filter the public stream by english tweets containing `#javascript`
    var stream = Twit.stream('statuses/filter', { track:  ['#meteor', '#javascript'], language: 'en' })
    stream.on('tweet', Meteor.bindEnvironment(function (tweet) {
      var image = tweet.user.profile_image_url;
      var user = tweet.user.name;
      var tweet = tweet.text;

      console.log(user + ' said '+ tweet);
      console.log('=======================================')

      appbaseRef.index({
        type: 'tweets',
        body: {
          user: user, 
          tweet: tweet, 
          picture: image
        }
      })
    }))
  })
}
