App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Voter.json", function(voter) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Voter = TruffleContract(voter);
      // Connect provider to interact with contract
      App.contracts.Voter.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Voter.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var voterInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    //getCoinBase provides us the account we are connected to.
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Voter.deployed().then(function(instance) {
      voterInstance = instance;
      return voterInstance.candidatesCount();
    }).then(function(candidatesCount) {
      // $('#voteCount').html('vote1');
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        voterInstance.candidates(i).then(function(candidate) {
          var id = candidate[0].toNumber();
          var name = candidate[1];
          var voteCount = candidate[2].toNumber(); 

          // Render candidate Result
          if(id===1)
          {
          $('#voteCount1').html(voteCount);
          }
          else if(id===2)
          {
            $('#voteCount2').html(voteCount);
          }
          else if(id===3)
          {
            $('#voteCount3').html(voteCount);
          }
          // var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          // candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          // var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          // candidatesSelect.append(candidateOption);
        });
      }
      return voterInstance.voterMap(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var candidateId = $('#selectedCandidate').val();
    App.contracts.Voter.deployed().then(function(instance) {
      return instance.provideVotes(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
